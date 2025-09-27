import Foundation
import Capacitor
import CoreLocation

@objc(RunnerLocationPlugin)
public class RunnerLocationPlugin: CAPPlugin {
    private let locationManager = CLLocationManager()
    private var runId: String?
    private var minimumDistanceMeters: Double = 10
    private var isTracking = false
    private var lastLocation: CLLocation?
    private var lastBroadcastAt: Date?
    private let minTimeGap: TimeInterval = 60

    private var idToken: String?
    private var refreshToken: String?
    private var idTokenExpiry: Date?
    private var apiKey: String?
    private var projectId: String?

    private let tokenQueue = DispatchQueue(label: "com.cheering.rocket.runnerLocation.token")
    private let uploadQueue = DispatchQueue(label: "com.cheering.rocket.runnerLocation.upload")
    private var pendingPayloads: [LocationPayload] = []
    private var isProcessingQueue = false
    private var scheduledRetryWorkItem: DispatchWorkItem?

    private let defaults = UserDefaults.standard

    #if DEBUG
    private let debugLogging = true
    #else
    private let debugLogging = false
    #endif

    private enum DefaultsKey {
        static let runId = "runnerLocation.runId"
        static let lastLat = "runnerLocation.lastLat"
        static let lastLng = "runnerLocation.lastLng"
        static let idToken = "runnerLocation.idToken"
        static let refreshToken = "runnerLocation.refreshToken"
        static let idTokenExpiry = "runnerLocation.idTokenExpiry"
        static let apiKey = "runnerLocation.apiKey"
        static let projectId = "runnerLocation.projectId"
        static let minimumDistance = "runnerLocation.minimumDistance"
    }

    private static let isoFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        return formatter
    }()

    override public func load() {
        super.load()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        locationManager.showsBackgroundLocationIndicator = true
        restoreStateFromDefaults()
    }

    @objc override public func checkPermissions(_ call: CAPPluginCall) {
        let status = CLLocationManager.authorizationStatus()
        let granted = status == .authorizedAlways
        call.resolve([
            "location": granted ? "granted" : "denied"
        ])
    }

    @objc public func start(_ call: CAPPluginCall) {
        guard let runId = call.getString("runId"), !runId.isEmpty else {
            call.reject("runId is required")
            return
        }
        guard let idToken = call.getString("idToken"), !idToken.isEmpty else {
            call.reject("idToken is required")
            return
        }
        guard let projectId = call.getString("projectId"), !projectId.isEmpty else {
            call.reject("projectId is required")
            return
        }
        guard let apiKey = call.getString("apiKey"), !apiKey.isEmpty else {
            call.reject("apiKey is required")
            return
        }

        self.runId = runId
        self.minimumDistanceMeters = call.getDouble("minimumDistanceMeters") ?? 10
        self.idToken = idToken
        self.refreshToken = call.getString("refreshToken")
        if let expiryMillis = call.getDouble("idTokenExpiry") {
            self.idTokenExpiry = Date(timeIntervalSince1970: expiryMillis / 1000)
        } else {
            self.idTokenExpiry = Date().addingTimeInterval(55 * 60)
        }
        self.projectId = projectId
        self.apiKey = apiKey

        defaults.set(runId, forKey: DefaultsKey.runId)
        defaults.set(minimumDistanceMeters, forKey: DefaultsKey.minimumDistance)
        persistCredentials()

        DispatchQueue.main.async {
            let status = CLLocationManager.authorizationStatus()
            if status != .authorizedAlways {
                self.locationManager.requestAlwaysAuthorization()
            }
            self.locationManager.startUpdatingLocation()
            self.isTracking = true
            self.notifyStatus()
        }

        call.resolve(["started": true])
    }

    @objc public func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.locationManager.stopUpdatingLocation()
            self.locationManager.allowsBackgroundLocationUpdates = false
            self.isTracking = false
            self.lastLocation = nil
            self.lastBroadcastAt = nil
            self.defaults.removeObject(forKey: DefaultsKey.runId)
            self.defaults.removeObject(forKey: DefaultsKey.lastLat)
            self.defaults.removeObject(forKey: DefaultsKey.lastLng)
            self.defaults.removeObject(forKey: DefaultsKey.minimumDistance)
            self.notifyStatus()
        }

        uploadQueue.async {
            self.pendingPayloads.removeAll()
            self.cancelScheduledRetryLocked()
        }

        idToken = nil
        refreshToken = nil
        idTokenExpiry = nil
        apiKey = nil
        projectId = nil
        persistCredentials()

        call.resolve()
    }

    @objc public func getStatus(_ call: CAPPluginCall) {
        let granted = CLLocationManager.authorizationStatus() == .authorizedAlways
        call.resolve([
            "isTracking": isTracking,
            "hasBackgroundPermission": granted
        ])
    }

    private func restoreStateFromDefaults() {
        runId = defaults.string(forKey: DefaultsKey.runId)
        if defaults.object(forKey: DefaultsKey.minimumDistance) != nil {
            minimumDistanceMeters = defaults.double(forKey: DefaultsKey.minimumDistance)
        }
        idToken = defaults.string(forKey: DefaultsKey.idToken)
        refreshToken = defaults.string(forKey: DefaultsKey.refreshToken)
        apiKey = defaults.string(forKey: DefaultsKey.apiKey)
        projectId = defaults.string(forKey: DefaultsKey.projectId)
        if let expiryMillis = defaults.object(forKey: DefaultsKey.idTokenExpiry) as? Double {
            idTokenExpiry = Date(timeIntervalSince1970: expiryMillis / 1000)
        }
    }

    private func persistCredentials() {
        if let idToken {
            defaults.set(idToken, forKey: DefaultsKey.idToken)
        } else {
            defaults.removeObject(forKey: DefaultsKey.idToken)
        }
        if let refreshToken {
            defaults.set(refreshToken, forKey: DefaultsKey.refreshToken)
        } else {
            defaults.removeObject(forKey: DefaultsKey.refreshToken)
        }
        if let apiKey {
            defaults.set(apiKey, forKey: DefaultsKey.apiKey)
        } else {
            defaults.removeObject(forKey: DefaultsKey.apiKey)
        }
        if let projectId {
            defaults.set(projectId, forKey: DefaultsKey.projectId)
        } else {
            defaults.removeObject(forKey: DefaultsKey.projectId)
        }
        if let idTokenExpiry {
            defaults.set(idTokenExpiry.timeIntervalSince1970 * 1000, forKey: DefaultsKey.idTokenExpiry)
        } else {
            defaults.removeObject(forKey: DefaultsKey.idTokenExpiry)
        }
    }

    private func notifyStatus() {
        let granted = CLLocationManager.authorizationStatus() == .authorizedAlways
        notifyListeners("status", data: [
            "isTracking": isTracking,
            "hasBackgroundPermission": granted
        ])
    }

    private func handle(location: CLLocation) {
        guard let runId else { return }
        guard location.horizontalAccuracy > 0 else { return }

        let last = lastLocation
        let timestamp = location.timestamp
        let shouldRecordByTime: Bool
        if let lastBroadcastAt {
            shouldRecordByTime = timestamp.timeIntervalSince(lastBroadcastAt) >= minTimeGap
        } else {
            shouldRecordByTime = true
        }

        if let last {
            let distance = location.distance(from: last)
            if distance < minimumDistanceMeters && !shouldRecordByTime {
                return
            }
        }

        lastLocation = location
        lastBroadcastAt = timestamp

        defaults.set(location.coordinate.latitude, forKey: DefaultsKey.lastLat)
        defaults.set(location.coordinate.longitude, forKey: DefaultsKey.lastLng)

        enqueueLocation(location)

        notifyListeners("locationUpdate", data: [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "altitude": location.verticalAccuracy >= 0 ? location.altitude : NSNull(),
            "speed": location.speedAccuracy >= 0 ? location.speed : NSNull(),
            "heading": location.courseAccuracy >= 0 ? location.course : NSNull(),
            "clientTimestamp": Int64(location.timestamp.timeIntervalSince1970 * 1000),
            "runId": runId
        ])
    }

    private func enqueueLocation(_ location: CLLocation) {
        guard let runId else { return }
        let payload = LocationPayload(runId: runId, location: location)
        uploadQueue.async {
            self.pendingPayloads.append(payload)
            self.processQueueIfNeeded()
        }
    }

    private func processQueueIfNeeded() {
        guard !isProcessingQueue else { return }
        guard !pendingPayloads.isEmpty else {
            cancelScheduledRetryLocked()
            return
        }
        isProcessingQueue = true
        let nextPayload = pendingPayloads.first!
        attemptUpload(payload: nextPayload, allowRefresh: true) { success, fatal in
            self.uploadQueue.async {
                if success || fatal {
                    self.pendingPayloads.removeFirst()
                }

                self.isProcessingQueue = false

                if success || fatal {
                    self.processQueueIfNeeded()
                } else {
                    self.scheduleRetryLocked()
                }
            }
        }
    }

    private func scheduleRetryLocked() {
        if let workItem = scheduledRetryWorkItem, !workItem.isCancelled {
            return
        }
        let workItem = DispatchWorkItem { [weak self] in
            guard let self else { return }
            self.uploadQueue.async {
                self.scheduledRetryWorkItem = nil
                self.processQueueIfNeeded()
            }
        }
        scheduledRetryWorkItem = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + 30, execute: workItem)
    }

    private func cancelScheduledRetryLocked() {
        if let workItem = scheduledRetryWorkItem {
            workItem.cancel()
            scheduledRetryWorkItem = nil
        }
    }

    private func attemptUpload(payload: LocationPayload, allowRefresh: Bool, completion: @escaping (Bool, Bool) -> Void) {
        guard let projectId = projectId, !projectId.isEmpty else {
            completion(false, true)
            return
        }

        getValidIdToken(forceRefresh: false) { token in
            guard let token else {
                completion(false, false)
                return
            }

            self.sendPayload(payload: payload, token: token, projectId: projectId) { success, fatal, unauthorized in
                if success || fatal || !unauthorized || !allowRefresh {
                    completion(success, fatal)
                    return
                }

                self.getValidIdToken(forceRefresh: true) { refreshedToken in
                    guard let refreshedToken else {
                        completion(false, fatal)
                        return
                    }
                    self.sendPayload(payload: payload, token: refreshedToken, projectId: projectId) { retrySuccess, retryFatal, _ in
                        completion(retrySuccess, retryFatal)
                    }
                }
            }
        }
    }

    private func getValidIdToken(forceRefresh: Bool, completion: @escaping (String?) -> Void) {
        tokenQueue.async {
            let now = Date()
            if !forceRefresh,
               let token = self.idToken,
               let expiry = self.idTokenExpiry,
               expiry.timeIntervalSince(now) > 60 {
                self.uploadQueue.async {
                    completion(token)
                }
                return
            }

            guard let refreshToken = self.refreshToken, !refreshToken.isEmpty,
                  let apiKey = self.apiKey, !apiKey.isEmpty else {
                self.uploadQueue.async {
                    completion(self.idToken)
                }
                return
            }

            self.refreshIdToken(refreshToken: refreshToken, apiKey: apiKey) { newToken in
                self.uploadQueue.async {
                    completion(newToken)
                }
            }
        }
    }

    private func refreshIdToken(refreshToken: String, apiKey: String, completion: @escaping (String?) -> Void) {
        guard let url = URL(string: "https://securetoken.googleapis.com/v1/token?key=\(apiKey)") else {
            completion(nil)
            return
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        let encodedRefresh = refreshToken.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? refreshToken
        request.httpBody = "grant_type=refresh_token&refresh_token=\(encodedRefresh)".data(using: .utf8)

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            self.tokenQueue.async {
                if let error {
                    if self.debugLogging {
                        NSLog("RunnerLocationPlugin token refresh error: %@", error.localizedDescription)
                    }
                    completion(nil)
                    return
                }

                guard
                    let data,
                    let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                    let newIdToken = json["id_token"] as? String
                else {
                    completion(nil)
                    return
                }

                let newRefresh = (json["refresh_token"] as? String) ?? refreshToken
                if let expiresString = json["expires_in"] as? String, let expiresDouble = Double(expiresString) {
                    let interval = max((expiresDouble - 60.0), 300.0)
                    self.idTokenExpiry = Date().addingTimeInterval(interval)
                } else {
                    self.idTokenExpiry = Date().addingTimeInterval(55 * 60)
                }

                self.idToken = newIdToken
                self.refreshToken = newRefresh
                self.persistCredentials()
                completion(newIdToken)
            }
        }
        task.resume()
    }

    private func sendPayload(payload: LocationPayload, token: String, projectId: String, completion: @escaping (Bool, Bool, Bool) -> Void) {
        guard let url = URL(string: "https://firestore.googleapis.com/v1/projects/\(projectId)/databases/(default)/documents/locationPoints"),
              let body = payload.toFirestoreBodyData()
        else {
            completion(false, true, false)
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = body

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            self.uploadQueue.async {
                if let error {
                    if self.debugLogging {
                        NSLog("RunnerLocationPlugin Firestore error: %@", error.localizedDescription)
                    }
                    completion(false, false, false)
                    return
                }

                guard let httpResponse = response as? HTTPURLResponse else {
                    completion(false, false, false)
                    return
                }

                if (200...299).contains(httpResponse.statusCode) {
                    completion(true, false, false)
                    return
                }

                if httpResponse.statusCode == 401 || httpResponse.statusCode == 403 {
                    completion(false, false, true)
                    return
                }

                let fatal = (400...499).contains(httpResponse.statusCode)
                if self.debugLogging, let data, let body = String(data: data, encoding: .utf8) {
                    NSLog("RunnerLocationPlugin Firestore response %ld: %@", httpResponse.statusCode, body)
                }
                completion(false, fatal, false)
            }
        }
        task.resume()
    }
}

private struct LocationPayload {
    let runId: String
    let latitude: Double
    let longitude: Double
    let accuracy: Double
    let altitude: Double?
    let speed: Double?
    let heading: Double?
    let clientTimestamp: Int64
    let recordedAt: Date

    init(runId: String, location: CLLocation) {
        self.runId = runId
        latitude = location.coordinate.latitude
        longitude = location.coordinate.longitude
        accuracy = location.horizontalAccuracy
        altitude = location.verticalAccuracy >= 0 ? location.altitude : nil
        speed = location.speedAccuracy >= 0 ? location.speed : nil
        heading = location.courseAccuracy >= 0 ? location.course : nil
        clientTimestamp = Int64(location.timestamp.timeIntervalSince1970 * 1000)
        recordedAt = Date()
    }

    private func stringField(_ value: String) -> [String: Any] { ["stringValue": value] }
    private func doubleField(_ value: Double) -> [String: Any] { ["doubleValue": value] }
    private func integerField(_ value: Int64) -> [String: Any] { ["integerValue": String(value)] }
    private func timestampField(_ date: Date) -> [String: Any] { ["timestampValue": RunnerLocationPlugin.isoFormatter.string(from: date)] }

    func toFirestoreBody() -> [String: Any] {
        var fields: [String: Any] = [
            "runId": stringField(runId),
            "latitude": doubleField(latitude),
            "longitude": doubleField(longitude),
            "accuracy": doubleField(accuracy),
            "clientTimestamp": integerField(clientTimestamp),
            "timestamp": timestampField(Date(timeIntervalSince1970: TimeInterval(clientTimestamp) / 1000)),
            "recordedAt": timestampField(recordedAt),
            "platform": stringField("ios")
        ]

        if let altitude {
            fields["altitude"] = doubleField(altitude)
        }
        if let speed {
            fields["speed"] = doubleField(speed)
        }
        if let heading {
            fields["heading"] = doubleField(heading)
        }

        return ["fields": fields]
    }

    func toFirestoreBodyData() -> Data? {
        let body = toFirestoreBody()
        return try? JSONSerialization.data(withJSONObject: body, options: [])
    }
}

extension RunnerLocationPlugin: CLLocationManagerDelegate {
    public func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        if status == .authorizedAlways {
            manager.startUpdatingLocation()
            isTracking = true
        } else if status == .denied || status == .restricted {
            isTracking = false
            manager.stopUpdatingLocation()
        }
        notifyStatus()
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        handle(location: location)
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        notifyListeners("status", data: [
            "isTracking": isTracking,
            "hasBackgroundPermission": CLLocationManager.authorizationStatus() == .authorizedAlways,
            "error": error.localizedDescription
        ])
    }
}

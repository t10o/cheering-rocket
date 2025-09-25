import Foundation
import Capacitor
import CoreLocation
import FirebaseCore
import FirebaseFirestore

@objc(RunnerLocationPlugin)
public class RunnerLocationPlugin: CAPPlugin {
    private let locationManager = CLLocationManager()
    private var firestore: Firestore?
    private var runId: String?
    private var minimumDistanceMeters: Double = 10
    private var isTracking = false
    private var lastLocation: CLLocation?

    override public func load() {
        super.load()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        locationManager.showsBackgroundLocationIndicator = true
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

        self.runId = runId
        self.minimumDistanceMeters = call.getDouble("minimumDistanceMeters") ?? 10

        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
        }
        firestore = Firestore.firestore()

        UserDefaults.standard.set(runId, forKey: "runnerLocation.runId")

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
            UserDefaults.standard.removeObject(forKey: "runnerLocation.runId")
            UserDefaults.standard.removeObject(forKey: "runnerLocation.lastLat")
            UserDefaults.standard.removeObject(forKey: "runnerLocation.lastLng")
            self.notifyStatus()
        }
        call.resolve()
    }

    @objc public func getStatus(_ call: CAPPluginCall) {
        let granted = CLLocationManager.authorizationStatus() == .authorizedAlways
        call.resolve([
            "isTracking": isTracking,
            "hasBackgroundPermission": granted
        ])
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
        guard let firestore else { return }
        guard location.horizontalAccuracy > 0 else { return }

        let last = lastLocation
        if let last {
            let distance = location.distance(from: last)
            if distance < minimumDistanceMeters {
                return
            }
        }

        lastLocation = location

        let defaults = UserDefaults.standard
        defaults.set(location.coordinate.latitude, forKey: "runnerLocation.lastLat")
        defaults.set(location.coordinate.longitude, forKey: "runnerLocation.lastLng")

        var data: [String: Any] = [
            "runId": runId,
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "clientTimestamp": Int64(location.timestamp.timeIntervalSince1970 * 1000),
            "recordedAt": FieldValue.serverTimestamp()
        ]

        if location.verticalAccuracy >= 0 {
            data["altitude"] = location.altitude
        }
        if location.speedAccuracy >= 0 {
            data["speed"] = location.speed
        }
        if location.courseAccuracy >= 0 {
            data["heading"] = location.course
        }

        firestore.collection("locationPoints").addDocument(data: data)

        notifyListeners("locationUpdate", data: [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "altitude": location.verticalAccuracy >= 0 ? location.altitude : NSNull(),
            "speed": location.speedAccuracy >= 0 ? location.speed : NSNull(),
            "heading": location.courseAccuracy >= 0 ? location.course : NSNull(),
            "clientTimestamp": Int64(location.timestamp.timeIntervalSince1970 * 1000)
        ])
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

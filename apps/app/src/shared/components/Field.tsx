type FieldProps = {
  label: string;
  children: React.ReactNode;
};

export const Field = ({ label, children }: FieldProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
};

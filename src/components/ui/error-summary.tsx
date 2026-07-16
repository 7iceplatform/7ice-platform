interface ErrorSummaryProps {
  errors: { field: string; message: string }[];
}

export function ErrorSummary({ errors }: ErrorSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
      <h3 className="font-medium text-red-800 mb-2">Ошибки в форме:</h3>
      <ul className="list-disc list-inside space-y-1 text-red-700">
        {errors.map((error) => (
          <li key={error.field}>
            <a href={`#${error.field}`} className="underline hover:no-underline">
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

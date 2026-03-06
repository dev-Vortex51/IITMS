import { Button } from "@/components/ui/button";

interface TablePaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePaginationBar({
  page,
  totalPages,
  onPageChange,
}: TablePaginationBarProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-between border-t p-4">
      <Button
        variant="outline"
        size="sm"
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </Button>
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <Button
        variant="outline"
        size="sm"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}

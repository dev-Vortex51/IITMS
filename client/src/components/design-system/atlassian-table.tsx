import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Group, Text } from "@mantine/core";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { EmptyState } from "./empty-state";
import { cn } from "@/lib/utils";

export interface AtlassianTableColumn<T> {
  id: string;
  header: string;
  width?: string | number;
  align?: "left" | "center" | "right";
  render: (row: T) => ReactNode;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number;
}

interface AtlassianTableProps<T> {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  data: T[];
  columns: AtlassianTableColumn<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon?: ReactNode;
  className?: string;
  initialPageSize?: number;
  selectableRows?: boolean;
  onSelectionChange?: (selectedRowKeys: string[]) => void;
}

export function AtlassianTable<T>({
  title,
  subtitle,
  actions,
  data,
  columns,
  rowKey,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  className,
  initialPageSize = 10,
  selectableRows = false,
  onSelectionChange,
}: AtlassianTableProps<T>) {
  const PAGE_SIZE_OPTIONS = [10, 20, 50];
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<T>>({
    columnAccessor: columns[0]?.id || "id",
    direction: "asc",
  });
  const [selectedRecords, setSelectedRecords] = useState<T[]>([]);

  const deferredData = useDeferredValue(data);

  const sortedData = useMemo(() => {
    const column = columns.find((col) => col.id === sortStatus.columnAccessor);
    if (!column?.sortable || !column.sortAccessor) return deferredData;

    const sorted = [...deferredData].sort((a, b) => {
      const aValue = column.sortAccessor!(a);
      const bValue = column.sortAccessor!(b);
      if (aValue === bValue) return 0;
      return aValue > bValue ? 1 : -1;
    });

    return sortStatus.direction === "asc" ? sorted : sorted.reverse();
  }, [columns, deferredData, sortStatus.columnAccessor, sortStatus.direction]);

  const totalRows = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [page, pageSize, sortedData]);

  useEffect(() => {
    onSelectionChange?.(selectedRecords.map((record) => rowKey(record)));
  }, [onSelectionChange, rowKey, selectedRecords]);

  const dataTableColumns = useMemo(
    () =>
      columns.map((column) => ({
        accessor: column.id,
        title: column.header,
        sortable: column.sortable,
        width: column.width,
        textAlign: column.align,
        render: (record: T) => column.render(record),
      })),
    [columns],
  );

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card shadow-sm", className)}>
      {title || subtitle || actions ? (
        <div className="border-b border-border bg-muted/40 px-4 py-3">
          <Group justify="space-between" align="center">
            <div>
              {title ? (
                <Text fw={700} size="sm" className="text-foreground">
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text size="xs" c="dimmed" mt={2}>
                  {subtitle}
                </Text>
              ) : null}
            </div>
            {actions ? <div>{actions}</div> : null}
          </Group>
        </div>
      ) : null}

      <DataTable
        idAccessor={(record) => rowKey(record as T)}
        withTableBorder={false}
        withColumnBorders={false}
        borderRadius="sm"
        striped={false}
        highlightOnHover
        minHeight={loading || totalRows === 0 ? 360 : 0}
        records={paginatedData}
        columns={dataTableColumns}
        fetching={loading}
        noRecordsText=""
        emptyState={
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon={emptyIcon}
            className="py-12"
          />
        }
        sortStatus={sortStatus}
        onSortStatusChange={(status) => {
          setPage(1);
          setSortStatus(status as DataTableSortStatus<T>);
        }}
        page={page}
        onPageChange={setPage}
        totalRecords={totalRows}
        recordsPerPage={pageSize}
        onRecordsPerPageChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        recordsPerPageOptions={PAGE_SIZE_OPTIONS}
        recordsPerPageLabel="Rows per page"
        selectedRecords={selectableRows ? selectedRecords : undefined}
        onSelectedRecordsChange={selectableRows ? setSelectedRecords : undefined}
      />
    </div>
  );
}

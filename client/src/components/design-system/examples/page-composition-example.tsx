import {
  AlertInline,
  EmptyState,
  FilterBar,
  FilterFieldSearch,
  PageHeader,
  SectionCard,
  StatRingCard,
  StatsGrid,
  TablePaginationBar,
  TableShell,
  TableToolbar,
} from "@/components/design-system";

export function PageCompositionExample() {
  return (
    <div className="space-y-6">
      <PageHeader title="Example Page" description="Consistent composition demo" />
      <AlertInline tone="info" message="Use this pattern on all list pages." />
      <StatsGrid className="lg:grid-cols-3">
        <StatRingCard label="Students" value={120} progress={100} color="blue" trend="up" />
        <StatRingCard label="Placements" value={97} progress={81} color="green" trend="up" />
        <StatRingCard label="Pending" value={13} progress={11} color="yellow" trend="down" />
      </StatsGrid>
      <SectionCard title="Records">
        <FilterBar>
          <FilterFieldSearch placeholder="Search..." />
        </FilterBar>
      </SectionCard>
      <TableShell title="Data Table">
        <TableToolbar left={<span className="text-sm text-muted-foreground">Showing 10 records</span>} />
        <EmptyState title="No Data" description="Apply filters or create a new record." />
        <TablePaginationBar page={1} totalPages={1} onPageChange={() => {}} />
      </TableShell>
    </div>
  );
}

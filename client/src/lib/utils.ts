export const dataGridClassNames =
  "!border-none text-foreground bg-card shadow-sm rounded-xl";

/**
 * MUI DataGrid SX overrides.
 *
 * All values use CSS variables so they automatically respond to dark/light mode
 * toggling via the .dark class on <html>. Previously MUI's internal default white
 * backgrounds were not overridden, causing the DataGrid body to appear white in
 * dark mode (MAJ-01).
 *
 * The isDarkMode parameter is retained for API compatibility but is no longer used
 * for color selection — CSS variables handle that automatically.
 */
export const dataGridSxStyles = (_isDarkMode: boolean) => {
  return {
    // Root container
    "& .MuiDataGrid-root": {
      backgroundColor: "transparent",
      border: "none",
      color: "hsl(var(--foreground))",
    },
    // Main content area (where rows render)
    "& .MuiDataGrid-main": {
      backgroundColor: "transparent",
    },
    // Virtual scroller — the scrollable rows container. This was the primary
    // culprit rendering white in dark mode.
    "& .MuiDataGrid-virtualScroller": {
      backgroundColor: "transparent",
    },
    "& .MuiDataGrid-virtualScrollerContent": {
      backgroundColor: "transparent",
    },
    // Column headers
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "transparent",
      color: "hsl(var(--foreground))",
      borderBottom: "1px solid hsl(var(--border))",
    },
    '& .MuiDataGrid-columnHeaders [role="row"]': {
      backgroundColor: "transparent",
    },
    "& .MuiDataGrid-columnHeader": {
      backgroundColor: "transparent",
      "&:focus, &:focus-within": {
        outline: "none",
      },
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "hsl(var(--muted-foreground))",
      fontWeight: 600,
      fontSize: "0.75rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    "& .MuiDataGrid-columnSeparator": {
      color: "hsl(var(--border))",
    },
    // Individual rows
    "& .MuiDataGrid-row": {
      backgroundColor: "transparent",
      borderBottom: "1px solid hsl(var(--border))",
      "&:hover": {
        backgroundColor: "hsl(var(--muted) / 0.4)",
      },
      "&.Mui-selected": {
        backgroundColor: "hsl(var(--primary) / 0.08)",
        "&:hover": {
          backgroundColor: "hsl(var(--primary) / 0.12)",
        },
      },
    },
    // Individual cells
    "& .MuiDataGrid-cell": {
      border: "none",
      color: "hsl(var(--foreground))",
      backgroundColor: "transparent",
      "&:focus, &:focus-within": {
        outline: "none",
      },
    },
    // Footer (pagination)
    "& .MuiDataGrid-footerContainer": {
      backgroundColor: "transparent",
      borderTop: "1px solid hsl(var(--border))",
      color: "hsl(var(--foreground))",
    },
    "& .MuiTablePagination-root": {
      color: "hsl(var(--foreground))",
    },
    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
      color: "hsl(var(--muted-foreground))",
      fontSize: "0.75rem",
    },
    "& .MuiTablePagination-select": {
      color: "hsl(var(--foreground))",
    },
    "& .MuiTablePagination-selectIcon": {
      color: "hsl(var(--muted-foreground))",
    },
    // Icon buttons (sort, filter, pagination arrows)
    "& .MuiIconButton-root": {
      color: "hsl(var(--muted-foreground))",
      "&:hover": {
        backgroundColor: "hsl(var(--muted) / 0.5)",
        color: "hsl(var(--foreground))",
      },
      "&.Mui-disabled": {
        color: "hsl(var(--muted-foreground) / 0.4)",
      },
    },
    // Checkboxes (row selection)
    "& .MuiCheckbox-root": {
      color: "hsl(var(--muted-foreground))",
      "&.Mui-checked": {
        color: "hsl(var(--primary))",
      },
    },
    // Border color utility
    "& .MuiDataGrid-withBorderColor": {
      borderColor: "hsl(var(--border))",
    },
    // Filler cells at the end of the header row
    "& .MuiDataGrid-filler": {
      backgroundColor: "transparent",
    },
    // Overlay (empty state / loading)
    "& .MuiDataGrid-overlay": {
      backgroundColor: "transparent",
      color: "hsl(var(--muted-foreground))",
    },
    // Sort icon
    "& .MuiDataGrid-sortIcon": {
      color: "hsl(var(--muted-foreground))",
    },
    "& .MuiDataGrid-menuIconButton": {
      color: "hsl(var(--muted-foreground))",
    },
  };
};

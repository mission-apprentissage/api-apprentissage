import { Box, Grid, Typography } from "@mui/material";
import { Fragment } from "react";

interface Props<TData> {
  title?: string;
  data: TData;
  rows: {
    [key: string]: {
      header?: () => React.ReactNode;
      cell?: (data: TData) => React.ReactNode;
    };
  };
}
/**
 * A handy component to display a list of key/value pairs
 * largely inspired by @tanstack/react-table
 */
const InfoDetails = <TData,>({ title, rows, data }: Props<TData>) => {
  return (
    <Box my={4}>
      {title && (
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
      )}
      <Grid container spacing={2}>
        {Object.entries(rows).map(([key, { header, cell }]) => {
          const dataKey = key as keyof TData;
          const value = data[dataKey];

          return (
            <Fragment key={key}>
              <Grid
                display="flex"
                alignItems="center"
                size={{
                  xs: 6,
                  md: 3,
                }}
              >
                {header?.() ?? key}
              </Grid>
              <Grid
                display="flex"
                alignItems="center"
                size={{
                  xs: 6,
                  md: 9,
                }}
              >
                {/* @ts-ignore */}
                {cell?.(data) ?? value}
              </Grid>
            </Fragment>
          );
        })}
      </Grid>
    </Box>
  );
};

export default InfoDetails;

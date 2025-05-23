import {Box, Typography} from "@strapi/design-system";
import React from "react";

export const Header = () => {
  return (
    <Box marginBottom={4}>
      <Typography variant="alpha" as="h1">
        Import & Export Data
      </Typography>
      <Typography variant="epsilon" as="p">
        Select a collection to import data from CSV or JSON, or export your data in one click.
      </Typography>
    </Box>
  );
};

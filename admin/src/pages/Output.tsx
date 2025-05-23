import {Box, Typography} from "@strapi/design-system";
import React from "react";

interface Props {
  debugLog: string
  importLog: string
}

export const Output = (props: Props) => {
  return <Box marginTop={8}>
    <Box marginBottom={2}>
      <Typography variant="delta" as="h4">
        Output:
      </Typography>
    </Box>
    {props.importLog && <Box background="neutral100" hasRadius padding={4}>
      {props.importLog && (
        <Box marginTop={4}>
          <Typography
            variant="omega"
            textColor="danger600"
            as="pre"
            style={{whiteSpace: "pre-line"}}
          >
            {props.importLog}
          </Typography>
        </Box>
      )}
      {props.debugLog && (
        <Box marginTop={4}>
          <Typography
            variant="omega"
            textColor="primary600"
            as="pre"
            style={{whiteSpace: "pre-line", fontSize: 11}}
          >
            {props.debugLog}
          </Typography>
        </Box>
      )}
    </Box>}
  </Box>
}

import {Box, Button, SingleSelect, SingleSelectOption, Typography} from "@strapi/design-system";
import React from "react";

interface Props {
  selected: string | undefined
  setSelected: (s: string | undefined) => void
  tables: { uid: string; tableName: string; displayName: string }[]
  onDownload: (type: "json" | "csv") => void
  downloading: "csv" | "json" | false
}

export const Export = (props: Props) => {

  console.log("+++props?.tables", props?.tables)

  return <Box marginBottom={6}>

    <Box marginBottom={2}>
      <Typography variant="delta" as="h4">
        Export
      </Typography>
    </Box>

    <Box marginBottom={4}>
      <SingleSelect
        label="Tables"
        placeholder="Select a table"
        value={props.selected}
        onChange={props.setSelected}
      >
        {props?.tables?.map((table) => (
          <SingleSelectOption key={table.uid} value={table.uid}>
            {`${table.displayName} (${table.tableName})`}
          </SingleSelectOption>
        ))}
      </SingleSelect>
    </Box>

    <Box display="flex">
      <Button
        style={{marginRight: 10}}
        size={3}
        onClick={() => props.onDownload("json")}
        disabled={!props.selected || props.downloading === "json"}
        loading={props.downloading === "json"}
        variant="default"
      >
        Download JSON
      </Button>
      <Button
        style={{marginRight: 10}}
        onClick={() => props.onDownload("csv")}
        disabled={!props.selected || props.downloading === "csv"}
        loading={props.downloading === "csv"}
        variant="default"
      >
        Download CSV
      </Button>

    </Box>

  </Box>

}

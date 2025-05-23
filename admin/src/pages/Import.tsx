import {Box, Button, Flex, TextInput, Typography} from "@strapi/design-system";
import React from "react";

interface Props {
  csvDelimiter: string
  setCsvDelimiter: (newCsvDelimiter: string) => void;
  fileInputRef: any
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;
  fileName: string
  selected: string | undefined
  importing: boolean
}

export const Import = (props: Props) => {
  return <Box marginBottom={6}>
    <Box marginBottom={2}>
      <Typography variant="delta" as="h4">
        Import
      </Typography>
    </Box>
    <Box marginBottom={4}>
      <Flex alignItems="center">
        <TextInput
          style={{width: 50, marginRight: 10}}
          size="S"
          label="CSV delimiter (default is comma)"
          placeholder="Enter delimiter"
          name="csv-delimiter"
          value={props.csvDelimiter}
          onChange={(e: any) => props.setCsvDelimiter(e.target.value)}
          hint="For example: , ; | \t"
        />
        <Typography variant="omega" style={{marginLeft: 10}}>
          Character that separates values in your CSV file.
          Examples: comma (,), semicolon (;), tab (\t)
        </Typography>
      </Flex>
    </Box>
    <input
      type="file"
      accept=".json,.csv"
      ref={props.fileInputRef}
      style={{display: "none"}}
      onChange={props.handleFileChange}
    />
    <Flex alignItems="center">
      <Button
        variant="default"
        style={{marginRight: 10}}
        onClick={() => props.fileInputRef?.current?.click()}
      >
        {props.fileName ? "Change file" : "Select file"}
      </Button>
      <Button
        disabled={!props.selected || props.importing || !props.fileName}
        loading={props.importing}
        variant="default"
        onClick={props.onImport}
      >
        Import
      </Button>
    </Flex>
    <Box>
    </Box>
  </Box>
}

import { Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { kBorderRadius } from 'constants/visualComponentConstants'

const JSONEditorInput = styled(Box)`
  /* dark styling of the editor */
  .ace-jsoneditor .ace_scroller {
    background-color: #1C1C1C;
  }
  .ace-jsoneditor .ace_gutter {
      // background-color: #424242;
    background-color: #1C1C1C;
    color: #FAFAFA
  }
  div.jsoneditor-value.jsoneditor-string {
      color: red;
  }
  .ace-jsoneditor .ace_marker-layer .ace_active-line, .ace-jsoneditor .ace_gutter-active-line {
    // background: #3CCD64;
    background: #1C1C1C;
    color: #3CCD64 ;
  }
  .ace-jsoneditor .ace_cursor {
    border-left : 2px solid #3CCD64
  }
  .ace-jsoneditor .ace_variable{
    color: #FAFAFA;
  }
  .ace-jsoneditor .ace_marker-layer .ace_selection {
    background: #3CCD64 ;
    color: white;
  }
  .ace_fold-widget {
      color: #3CCD64
  }
  div.jsoneditor, div.jsoneditor-menu {
    border-color: #1C1C1C;
  }
  div.jsoneditor-value.jsoneditor-string, div.jsoneditor textarea.jsoneditor-text{
    color: #FAFAFA;
  }
  .ace-jsoneditor .ace_string {
    color : #3b8aee;
  }

  div.jsoneditor-value.jsoneditor-number {
    color: #ee422e;
  }

  div.jsoneditor-value.jsoneditor-boolean {
    color: #ff8c00;
  }

  div.jsoneditor-value.jsoneditor-null {
    color: #004ed0;
  }

  div.jsoneditor-value.jsoneditor-color-value {
    color: #1a1a1a;
  }

  div.jsoneditor-value.jsoneditor-invalid {
    color: #1a1a1a;
  }
  .ace-jsoneditor .ace_indent-guide {
    background: unset;
  }
  .ace-jsoneditor .ace_marker-layer .ace_bracket {
    // bracket border
    margin-left: 0px;
    margin-top: 0px;
  }
`

type Props = {
  containerRef: any
}

const Editor = ({ containerRef }: Props) => (
  <JSONEditorInput
    ref={containerRef}
    width="full"
    height="full"
    border="1px solid #FFFFFF"
    borderRadius={kBorderRadius}
    padding="24px"
  />
)

export default Editor

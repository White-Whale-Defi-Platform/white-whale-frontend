import { useRef } from 'react'
import { MdOutlineUploadFile } from 'react-icons/md'

import { Button } from '@chakra-ui/react'

type Props = {
  handleChange: (event: any) => void
}

const UploadFile = ({ handleChange }: Props) => {
  const fileRef = useRef(null)

  const handleFile = () => {
    if (fileRef) {
      fileRef.current?.click()
    }
  }

  return (
    <>
      <Button
        width={[60, 120]}
        leftIcon={<MdOutlineUploadFile size={18} />}
        colorScheme="gray"
        variant="outline"
        onClick={handleFile}
      >
        Upload File
        <input
          ref={fileRef}
          id="upload"
          type="file"
          onChange={handleChange}
          style={{ visibility: 'hidden',
            width: 0 }}
        />
      </Button>
    </>
  )
}

export default UploadFile

import { useEffect, useMemo, useRef, useState } from 'react'
import { MdOutlineFormatIndentDecrease } from 'react-icons/md'

import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
  Stack,
} from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import { kBg, kBorderRadius } from 'constants/visualComponentConstants'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { TxStep } from 'types/index'

import Editor from './Editor'
import useFlashloan from './hooks/useFlashloan'
import 'jsoneditor/dist/jsoneditor.css'
import schema from './schema.json'
import UploadFile from './UploadFile'

const defaultJson = {
  flash_loan: {
    assets: [],
    msgs: [],
  },
}

const options = {
  schema,
  mainMenuBar: false,
  statusBar: false,
  navigationBar: false,
  mode: 'code',
  SchemaTextCompleter: true,
  allowSchemaSuggestions: true,
}

const FlashloanForm = () => {
  const editorRef = useRef(null)
  const containerRef = useRef(null)
  const [error, setError] = useState(null)
  const [json, setJson] = useState(defaultJson)
  const { walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(walletChainName)

  const tx = useFlashloan({ json })

  const onChange = async () => {
    try {
      const isValid = await editorRef?.current?.validate()
      if (isValid?.length === 0) {
        const jsonData = editorRef?.current?.get()
        setJson(jsonData)
        setError('')
      } else {
        setError('Message validation failed.')
      }
    } catch (e) {
      setError('Invalid JSON')
    }
  }

  const init = async () => {
    if (containerRef && editorRef) {
      const JSONEditor = await import('jsoneditor')
      editorRef.current = new JSONEditor.default(containerRef.current, {
        ...options,
        onChange,
      })
      editorRef.current.set(json)
    }
  }

  useEffect(() => {
    init()
    return () => {
      if (editorRef?.current) {
        editorRef?.current?.destroy()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, editorRef, options])

  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) {
      return 'Connect Wallet'
    } else if (error) {
      return error
    }
    return 'Flashloan'

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx?.buttonLabel, error])

  const handleChange = (event: any) => {
    const fileReader = new FileReader()
    fileReader.readAsText(event.target.files[0], 'UTF-8')
    // eslint-disable-next-line no-param-reassign
    event.target.value = null
    fileReader.onload = (e: any) => {
      try {
        if (error) {
          setError('')
        }
        setJson(JSON.parse(e?.target?.result))
        editorRef.current.set(JSON.parse(e.target.result))
      } catch (error) {
        editorRef.current.set(e.target.result)
        setError('Invalid JSON')
      }
    }
  }

  const format = () => {
    if (editorRef) {
      try {
        if (error) {
          setError('')
        }
        editorRef.current.repair()
        editorRef.current.format()
        const jsonData = editorRef?.current?.get()
        setJson(jsonData)
      } catch (e) {
        setError('Invalid JSON')
      }
    }
  }

  return (
    <Flex
      padding={10}
      width={'flex'}
      height={'600'}
      background={kBg}
      boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
      borderRadius={kBorderRadius}
      display={'flex'}
    >
      <VStack width={[kBorderRadius, 'full']} height={'full'}>
        <HStack
          width="full"
          justifyContent="space-between"
          p={4}
          alignItems="center"
        >
          <Box>
            <Text alignSelf="flex-start">JSON to execute the trade</Text>
          </Box>
          {/* <Error message={error || tx?.error} /> */}
        </HStack>
        <Editor containerRef={containerRef} />
        <HStack width="full" p={4}>
          <Stack direction={['column', 'row']} align={'center'}>
            <Button
              width={[60, 120]}
              leftIcon={<MdOutlineFormatIndentDecrease size={16} />}
              variant="outline"
              onClick={format}
            >
              Format
            </Button>
            <UploadFile handleChange={handleChange} />

            <Button
              onClick={tx?.submit}
              variant="primary"
              width={60}
              isLoading={
                // Tx?.txStep == TxStep.Estimating ||
                tx?.txStep === TxStep.Posting ||
                tx?.txStep === TxStep.Broadcasting
              }
              disabled={Boolean(error) || !isWalletConnected}
            >
              {buttonLabel}
            </Button>
          </Stack>
        </HStack>
      </VStack>
    </Flex>
  )
}

export default FlashloanForm

import {
    Box, Button,
    Flex,
    HStack, Text, VStack
} from '@chakra-ui/react'

import { MdOutlineFormatIndentDecrease } from 'react-icons/md'
import { useEffect, useRef, useState, useMemo } from 'react'
import Editor from './Editor'
import Error from './Error'
import useFlashloan from './hooks/useFlashloan'
import { TxStep } from './hooks/useTransaction'
import "jsoneditor/dist/jsoneditor.css";
import schema from './schema.json'
import UploadFile from './UploadFile'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

const defualtJson = {
    flash_loan: {
        assets: [],
        msgs: []
    }
}


type Props = {}

const options = {
    schema,
    mainMenuBar: false,
    statusBar: false,
    navigationBar: false,
    mode: "code",
    SchemaTextCompleter: true,
    allowSchemaSuggestions: true,
}

function FlashloanForm({ }: Props) {

    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const [json, setJson] = useState(defualtJson)
    const { status } = useRecoilValue(walletState)
    const isConnected = status === `@wallet-state/connected`

    const tx = useFlashloan({ json })


    useEffect(() => {
        init()
        return () => {
            if (editorRef?.current) {
                editorRef?.current?.destroy();
            }
        };
    }, [containerRef, editorRef, options]);

    const buttonLabel = useMemo(() => {
        if (!isConnected) return 'Connect Wallet'
        else if (!!error) return error
        else return 'Flashloan'
    }, [tx?.buttonLabel, status, error])

    const onChange = async (data) => {
        try {
            const isValid = await editorRef?.current?.validate()
            if (isValid?.length === 0) {
                const jsonData = editorRef?.current?.get()
                setJson(jsonData)
                setError('')
            } else {
                setError("Messgae validation failed.")
            }
        } catch (error) {
            setError("Invalid JSON")
        }
    }

    const init = async () => {
        if (containerRef && editorRef) {
            const JSONEditor = await import('jsoneditor')
            editorRef.current = new JSONEditor.default(containerRef.current, { ...options, onChange });
            editorRef.current.set(json);

        }
    }

    const handleChange = (event: any) => {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0], "UTF-8");
        event.target.value = null
        fileReader.onload = (e: any) => {
            try {
                if (error) setError('')
                setJson(JSON.parse(e?.target?.result))
                editorRef.current.set(JSON.parse(e.target.result));
            } catch (errro) {
                editorRef.current.set(e.target.result);
                setError("Invalid JSON")
            }
        };
    };

    const format = () => {
        if (editorRef) {
            try {
                if (error) setError('')
                editorRef.current.repair()
                editorRef.current.format()
                const jsonData = editorRef?.current?.get()
                setJson(jsonData)
            }
            catch (error) {
                setError("Invalid JSON")
            }
        }
    }

    return (
        <Flex
            padding={10}
            width={['full', '900px']}
            height="600px"
            background="#1C1C1C"
            boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
            borderRadius="30px"
            display={['none', 'flex']}
        >
            <VStack width="full" >
                <HStack width="full" justifyContent="space-between" p={4} alignItems="center">
                    <Box>
                        <Text alignSelf="flex-start" > JSON to execute the trade</Text>
                    </Box>
                    {/* <Error message={error || tx?.error} /> */}
                </HStack>

                <Editor containerRef={containerRef} />

                <HStack justify="space-between" width="full" p={4} alignItems="center" >
                    <HStack>
                        <Button
                            leftIcon={<MdOutlineFormatIndentDecrease size={16} />}
                            variant='outline'
                            onClick={format}
                        >
                            Format
                        </Button>
                        <UploadFile handleChange={handleChange} />
                        {/* <Button
                            variant='outline'
                            isLoading={
                                tx?.txStep == TxStep.Estimating
                            }
                            disabled={!!error}
                            onClick={() => tx?.simulate()}
                        >
                            {tx?.buttonLabel ||  'Simulate'}
                        </Button> */}
                    </HStack>

                    <Button
                        onClick={tx?.submit}
                        variant="primary"
                        width={60}
                        isLoading={
                            // tx?.txStep == TxStep.Estimating ||
                            tx?.txStep == TxStep.Posting ||
                            tx?.txStep == TxStep.Broadcasting
                        }
                        disabled={!!error || !isConnected}
                    >
                        {buttonLabel}
                    </Button>
                </HStack>

                {/* <Text>{JSON.stringify(json, null, 2)}</Text> */}

            </VStack>
        </Flex>
    )
}

export default FlashloanForm
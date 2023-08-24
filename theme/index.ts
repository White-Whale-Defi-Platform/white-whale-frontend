import { extendTheme } from '@chakra-ui/react'
import { getColor, transparentize } from '@chakra-ui/theme-tools'

export default extendTheme({
  styles: {
    global: {
      body: {
        background: '#191919',
      },
      config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
      },
    },
  },
  fonts: {
    heading:
      'Lato,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
    body: 'Lato,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
    mono: 'Menlo, monospace',
  },
  components: {
    Modal: {
      baseStyle: {
        overlay: {
          bg: 'rgba(17, 17, 17, 0.2)',
          backdropFilter: 'blur(12px)',
        },
        dialog: {
          borderRadius: '2xl',
          bg: 'rgba(26,26,26,0.8)',
          py: '8',
          color: 'white',
          boxShadow: '2xl',
        },
        closeButton: {
          color: 'rgba(255, 255, 255, 0.6)',
          _focus: {
            boxShadow: 'none',
          },
        },
      },
    },
    Tooltip: {
      baseStyle: {
        px: '4',
        py: '3',
        bg: 'brand.600',
        borderRadius: 'full',
        color: 'white',
      },
    },
    Drawer: {
      baseStyle: {
        overlay: {
          bg: 'rgba(17, 17, 17, 0.2)',
          backdropFilter: 'blur(12px)',
        },
        dialog: {
          borderRadius: '2xl',
          bg: 'rgba(26,26,26,0.8)',
          py: '8',
          color: 'white',
          boxShadow: '2xl',
        },
        closeButton: {
          color: 'rgba(255, 255, 255, 0.6)',
          _focus: {
            boxShadow: 'none',
          },
        },
      },
    },
    Text: {
      baseStyle: {
        color: 'white',
      },
      variants: {
        light: {
          color: 'brand.50',
          fontSize: 'sm',
        },
      },
    },
    Badge: {
      baseStyle: {
        fontSize: 'sm',
        px: '4',
        py: '2',
        borderRadius: 'full',
        textTransform: 'none',
      },
      variants: {
        brand: (props: Record<string, any>) => {
          const { colorScheme: c } = props
          return {
            bg: transparentize(`${c}.500`, 0.2),
            color: `${c}.500`,
          }
        },
      },
    },
    Button: {
      sizes: {
        lg: {
          height: '14',
        },
      },
      variants: {
        primary: {
          outline: 'none',
          borderRadius: '78px',
          paddingX: 6,
          bg: 'brand.500',
          color: 'white',
          _disabled: {
            bg: 'brand.50',
            color: 'white',
            opacity: 0.8,
          },
          _hover: {
            bg: 'brand.300',
            color: 'white',
            _disabled: {
              bg: 'brand.50',
              color: 'white',
              opacity: 0.8,
            },
          },
          _focus: {
            boxShadow: 'none',
          },
        },
        secondary: {
          borderRadius: 'full',
          borderWidth: '1px',
          borderColor: 'white',
          color: 'white',
          _hover: {
            bg: 'white',
            color: 'brand.900',
          },
          _active: {
            bg: 'white',
            color: 'brand.900',
          },
          _focus: {
            boxShadow: 'none',
          },
        },
        outline: {
          borderRadius: '78px',
          paddingX: 6,
          color: 'white',
          _disabled: {
            pointerEvents: 'none',
          },
          _focus: {
            boxShadow: 'none',
            backgroundColor: 'transparent',
          },
          _hover: {
            color: 'brand.500',
            backgroundColor: 'transparent',
            borderColor: 'brand.500',
          },
        },
        third: {
          outline: 'none',
          borderRadius: 'full',
          borderWidth: '1px',
          borderColor: 'brand.900',
          color: 'white',
          _hover: {
            color: 'white',
            borderColor: 'brand.500',
          },
          _active: {
            borderColor: 'brand.500',
          },
          _focus: {
            boxShadow: 'none',
          },
        },
        navbar: {
          outline: 'none',
          color: 'white',
          p: '0',
          _hover: {
            color: 'brand.500',
          },
          _focus: {
            boxShadow: 'none',
          },
        },
        wallet: {
          transition: '0.2s all',
          width: 'full',
          colorScheme: 'black',
          borderRadius: 'xl',
          bg: 'dark.900',
          p: 8,
          _hover: {
            bg: 'brand.500',
            color: 'dark.900',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          fontWeight: '500',
        },
      },
      sizes: {
        lg: {
          field: {
            borderRadius: 'full',
            px: '5',
            fontSize: 'xl',
            height: '14',
          },
        },
      },
      variants: {
        brand: (props: Record<string, any>) => {
          const { theme } = props

          return {
            field: {
              border: '1px solid',
              borderColor: 'brand.100',
              bg: 'inherit',
              color: 'brand.500',
              fontWeight: '700',
              _hover: {
                borderColor: 'brand.500',
              },
              _invalid: {
                borderColor: 'red.500',
                boxShadow: `0 0 0 1px ${getColor(theme, 'red.500')}`,
              },
              _focus: {
                zIndex: 1,
                borderColor: 'brand.500',
                boxShadow: `0 0 0 1px ${getColor(theme, 'brand.500')}`,
              },
            },
          }
        },
      },
    },
    NumberInput: {
      baseStyle: {
        field: {
          fontWeight: '500',
        },
      },
      sizes: {
        lg: {
          field: {
            borderRadius: 'full',
            px: '5',
            fontSize: 'xl',
            height: '14',
          },
        },
      },
      variants: {
        brand: (props: Record<string, any>) => {
          const { theme } = props

          return {
            field: {
              border: '1px solid',
              borderColor: 'brand.100',
              bg: 'inherit',
              color: 'brand.500',
              fontWeight: '700',
              _hover: {
                borderColor: 'brand.500',
              },
              _invalid: {
                borderColor: 'red.500',
                boxShadow: `0 0 0 1px ${getColor(theme, 'red.500')}`,
              },
              _focus: {
                zIndex: 1,
                borderColor: 'brand.500',
                boxShadow: `0 0 0 1px ${getColor(theme, 'brand.500')}`,
              },
              _disabled: {
                _hover: {
                  borderColor: 'brand.100',
                },
              },
            },
          }
        },
      },
    },
    Textarea: {
      variants: {
        brand: (props: Record<string, any>) => {
          const { theme } = props

          return {
            border: '1px solid',
            borderColor: 'brand.100',
            borderRadius: '2xl',
            bg: 'inherit',
            color: 'brand.500',
            fontWeight: '700',
            _hover: {
              borderColor: 'brand.500',
            },
            _invalid: {
              borderColor: 'red.500',
              boxShadow: `0 0 0 1px ${getColor(theme, 'red.500')}`,
            },
            _focus: {
              zIndex: 1,
              borderColor: 'brand.500',
              boxShadow: `0 0 0 1px ${getColor(theme, 'brand.500')}`,
            },
          }
        },
      },
    },
    Tabs: {
      baseStyle: {
        tabpanel: {
          padding: '0',
          paddingTop: '6',
        },
      },
      variants: {
        brand: {
          tablist: {
            bg: 'rgba(26,26,26,1)',
            px: '8',
            justifyContent: 'center',
            mt: '-14',
            gap: '1rem',
            width: 'fit-content',
            mx: 'auto',
          },
          tab: {
            fontWeight: '700',
            color: 'whiteAlpha.600',
            fontSize: 'lg',
            _selected: {
              color: 'white',
            },
            _focus: {
              boxShadow: 'none',
              outline: 'none',
            },
          },
          tabpanel: {
            pt: 0,
          },
        },
        'soft-rounded': {
          tablist: {
            gap: '1rem',
          },
          tab: {
            borderRadius: 'full',
            fontWeight: '500',
            color: 'white',
            lineHeight: '1rem',
            fontSize: 'sm',
            border: '1px solid #303348',
            _selected: {
              borderColor: 'transparent',
              color: 'brand.900',
              bg: 'brand.500',
            },
            _focus: {
              boxShadow: 'none',
              outline: 'none',
            },
          },
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: 'brand.600',
          border: 'none',
          boxShadow: 'lg',
          minW: '9rem',
          borderRadius: '2xl',
        },
        item: {
          py: '0.6rem',
          px: '1.2rem',
          color: 'brand.50',
          fontWeight: '500',
          fontSize: 'sm',
          _hover: {
            color: 'white',
          },
          _focus: {
            bg: 'transparent',
          },
          _active: {
            bg: 'transparent',
          },
          _expanded: {
            bg: 'transparent',
          },
        },
      },
    },
  },
  colors: {
    brand: {
      50: '#ffffff80',
      100: '#B4FAB3',
      200: '#8AF092',
      300: '#69E17E',
      400: '#3ccd65',
      500: '#3CCD64',
      600: '#2BB05D',
      700: '#1E9355',
      800: '#13764B',
      900: '#0B6245',
    },
    dark: {
      900: '#252525',
    },
  },
})

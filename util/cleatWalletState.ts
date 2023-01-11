export const clearWalletState = (activeWallet) => {
  const _walletState = JSON.parse(
    localStorage.getItem(
      '@wasmswap/wallet-state/wallet-type-internal-wallet'
    ) || '{}'
  )
  if (!_walletState?.key) {
    localStorage.removeItem(
      '@wasmswap/wallet-state/wallet-type-internal-wallet'
    )
    alert(`Please install ${activeWallet} extension and refresh the page.`)
  }
}

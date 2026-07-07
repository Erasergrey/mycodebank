import AccountOperationPage from '../components/account/AccountOperationPage'

function DepositPage(props) {
  return <AccountOperationPage {...props} operationType="deposit" />
}

export default DepositPage

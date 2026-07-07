import AccountOperationPage from '../components/account/AccountOperationPage'

function WithdrawPage(props) {
  return <AccountOperationPage {...props} operationType="withdrawal" />
}

export default WithdrawPage

/**

Handles server network errors and updates the app state accordingly.
@param {unknown} err - The error object representing the network error.
@param {AppDispatch} dispatch - The dispatch function from the app's Redux store.
@returns {void}
*/

import { appActions } from 'app/app-slice'
import { AppDispatch } from 'app/store'
import axios from 'axios'

export const handleServerNetworkError = (err: unknown, dispatch: AppDispatch): void => {
  let errorMessage = 'Some error occurred'

  if (axios.isAxiosError(err)) {
    errorMessage = err.response?.data?.message || err?.message || errorMessage
  } else if (err instanceof Error) {
    errorMessage = `Native error: ${err.message}`
  } else {
    errorMessage = JSON.stringify(err)
  }

  dispatch(appActions.setAppError({ error: errorMessage }))
  dispatch(appActions.setAppStatus({ status: 'failed' }))
}

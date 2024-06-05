import { appActions } from 'app/app-slice'
import { ResponseType } from '../api/todolists-api'
import { Dispatch } from 'redux'
import axios from 'axios'
import { AppDispatch } from 'app/store'

/**

Handles server app errors and updates the app state accordingly.
@template D - The type of data returned from the server response.
@param {ResponseType<D>} data - The server response data.
@param {Dispatch} dispatch - The dispatch function from the app's Redux store.
@returns {void}
*/

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
  if (data.messages.length) {
    dispatch(appActions.setAppError({ error: data.messages[0] }))
  } else {
    dispatch(appActions.setAppError({ error: 'Some error occurred' }))
  }
  dispatch(appActions.setAppStatus({ status: 'failed' }))
}

/**

Handles server network errors and updates the app state accordingly.
@param {unknown} err - The error object representing the network error.
@param {AppDispatch} dispatch - The dispatch function from the app's Redux store.
@returns {void}
*/

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

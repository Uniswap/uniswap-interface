import { createSlice } from '@reduxjs/toolkit'
import { ConnectionType } from 'connection'

interface ConnectionState {
  errorByConnectionType: Record<ConnectionType, string | undefined>
}

const initialState: ConnectionState = {
  errorByConnectionType: {
    // [ConnectionType.UNIWALLET]: undefined,
    [ConnectionType.INJECTED]: undefined,
    [ConnectionType.WALLET_CONNECT_V2]: undefined,
    [ConnectionType.COINBASE_WALLET]: undefined,
    [ConnectionType.NETWORK]: undefined,
    [ConnectionType.GNOSIS_SAFE]: undefined,
    [ConnectionType.PALI_WALLET]: undefined,
  },
}

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    updateConnectionError(
      state,
      { payload: { connectionType, error } }: { payload: { connectionType: ConnectionType; error?: string } }
    ) {
      state.errorByConnectionType[connectionType] = error
    },
  },
})

export const { updateConnectionError } = connectionSlice.actions
export default connectionSlice.reducer

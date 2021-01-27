package test

import (
	"testing"

	"github.com/onflow/flow-go-sdk"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_Emulator(t *testing.T) {
	emulator := newEmulator()

	serviceAcct, err := emulator.GetAccount(flow.ServiceAddress(flow.Emulator))

	require.NoError(t, err)
	assert.NotNil(t, serviceAcct)
	assert.Equal(t, serviceAcct.Address.String(), "f8d6e0586b0a20c7")
}

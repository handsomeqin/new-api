@echo off
setlocal

echo Building new-api...
go build -ldflags "-s -w -X 'github.com/QuantumNous/new-api/common.Version=1.0.0'" -o new-api.exe

echo Build completed!
dir new-api.exe

endlocal
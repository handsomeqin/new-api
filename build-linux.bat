@echo off
setlocal

echo Building new-api for Linux...
go env -w GOOS=linux
go env -w GOARCH=amd64
go build -ldflags "-s -w -X 'github.com/QuantumNous/new-api/common.Version=1.0.0'" -o new-api

echo Build completed!
dir new-api

echo Restoring Go environment...
go env -u GOOS
go env -u GOARCH

endlocal
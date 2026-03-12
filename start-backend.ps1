$env:PATH += ";D:\Program Files\Go\bin"
go env -w GOPROXY=https://goproxy.cn,direct
go version
go run main.go
all: servercontroller

servercontroler: servercontroller.o
	g++ -fPIC -o $@ $@.o -lnsl -ldl

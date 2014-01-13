io = require 'socket.io/node_modules/socket.io-client'

module.exports = class ConnectionToServer

	constructor: (@communicator) ->

		@clientId = -1

		@isAuthenticated = no

		@initiallyLoaded = no

		do @_setupSocket

	_setupSocket: ->

		@_socket = io.connect(@communicator._server)

		@_socket.on 'authenticate', @_authenticate

		@_socket.on 'authentication-result', @_authenticationResult

		@_socket.on 'set-client-id', @_setClientId

		@_socket.on 'receive-head', @_recieveHead

		@_socket.on 'get-namespace', @_getNamespace

	_authenticate: =>

		console.log 'authenticating with', @communicator._password

		@_socket.emit 'authenticate', @communicator._password

	_setClientId: (clientId) =>

		@clientId = parseInt clientId

		console.log 'client id is', @clientId

	_authenticationResult: (data) =>

		@isAuthenticated = Boolean data

		if @isAuthenticated

			console.log 'authenticated'

			do @_decideOnLoading

		else

			console.log 'auth failed'

	_decideOnLoading: ->

		return if @initiallyLoaded

		@initiallyLoaded = yes

		console.log 'asking for head'

		@_socket.emit 'get-head'

	_recieveHead: (data) =>

		console.log 'receiving head:', data

	_getNamespace: =>

		console.log 'setting namespace to', @communicator._namespaceName

		@_socket.emit 'set-namespace', @communicator._namespaceName
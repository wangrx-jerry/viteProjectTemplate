export default function devProxyInfo() {
	return {
		name: 'dev-proxy-info',
		configureServer(server) {
			const proxy = server.config.server.proxy
			if (proxy) {
				server.config.define = server.config.define || {}
				server.config.define.__DEV_PROXY_URL__ = JSON.stringify(
					Object.fromEntries(Object.entries(proxy).map(([key, val]) => [key, (val as Record<string, any>).target]))
				)
			}
		}
	}
}

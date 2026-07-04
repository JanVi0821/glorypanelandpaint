interface PagesFunctionContext<Env = Record<string, unknown>> {
	request: Request;
	env: Env;
	params: Record<string, string | undefined>;
	waitUntil: (promise: Promise<unknown>) => void;
	passThroughOnException: () => void;
	next: () => Promise<Response>;
	url: URL;
}

type PagesFunction<Env = Record<string, unknown>> = (
	context: PagesFunctionContext<Env>,
) => Response | Promise<Response>;

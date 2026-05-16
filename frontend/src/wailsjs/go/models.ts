export namespace core {
	
	export class Request {
	    id: string;
	    name?: string;
	    method: string;
	    url: string;
	    headers: Record<string, string>;
	    body?: string;
	    pre_request_script?: string;
	    test_script?: string;
	    metadata?: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new Request(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.method = source["method"];
	        this.url = source["url"];
	        this.headers = source["headers"];
	        this.body = source["body"];
	        this.pre_request_script = source["pre_request_script"];
	        this.test_script = source["test_script"];
	        this.metadata = source["metadata"];
	    }
	}
	export class Collection {
	    path: string;
	    name: string;
	    requests?: Request[];
	    folders?: Collection[];
	
	    static createFrom(source: any = {}) {
	        return new Collection(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.name = source["name"];
	        this.requests = this.convertValues(source["requests"], Request);
	        this.folders = this.convertValues(source["folders"], Collection);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DetailedTiming {
	    dns: number;
	    tcp: number;
	    tls: number;
	    ttfb: number;
	    download: number;
	
	    static createFrom(source: any = {}) {
	        return new DetailedTiming(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.dns = source["dns"];
	        this.tcp = source["tcp"];
	        this.tls = source["tls"];
	        this.ttfb = source["ttfb"];
	        this.download = source["download"];
	    }
	}
	export class Environment {
	    name: string;
	    variables: Record<string, string>;
	    is_active: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Environment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.variables = source["variables"];
	        this.is_active = source["is_active"];
	    }
	}
	
	export class TestResult {
	    name: string;
	    passed: boolean;
	    message?: string;
	
	    static createFrom(source: any = {}) {
	        return new TestResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.passed = source["passed"];
	        this.message = source["message"];
	    }
	}
	export class Timing {
	    // Go type: time
	    start: any;
	    ttfb: number;
	    total: number;
	    detailed?: DetailedTiming;
	
	    static createFrom(source: any = {}) {
	        return new Timing(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.start = this.convertValues(source["start"], null);
	        this.ttfb = source["ttfb"];
	        this.total = source["total"];
	        this.detailed = this.convertValues(source["detailed"], DetailedTiming);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Response {
	    status: number;
	    status_text: string;
	    headers: Record<string, string>;
	    body: string;
	    timing: Timing;
	    error?: string;
	    request_ref?: string;
	    test_results?: TestResult[];
	
	    static createFrom(source: any = {}) {
	        return new Response(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.status = source["status"];
	        this.status_text = source["status_text"];
	        this.headers = source["headers"];
	        this.body = source["body"];
	        this.timing = this.convertValues(source["timing"], Timing);
	        this.error = source["error"];
	        this.request_ref = source["request_ref"];
	        this.test_results = this.convertValues(source["test_results"], TestResult);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}


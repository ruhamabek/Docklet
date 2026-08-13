export namespace client {
	
	export class ContainerRemoveResult {
	
	
	    static createFrom(source: any = {}) {
	        return new ContainerRemoveResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}
	export class ContainerStartResult {
	
	
	    static createFrom(source: any = {}) {
	        return new ContainerStartResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}
	export class ContainerStopResult {
	
	
	    static createFrom(source: any = {}) {
	        return new ContainerStopResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}
	export class ImageRemoveResult {
	    Items: image.DeleteResponse[];
	
	    static createFrom(source: any = {}) {
	        return new ImageRemoveResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Items = this.convertValues(source["Items"], image.DeleteResponse);
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

export namespace image {
	
	export class DeleteResponse {
	    Deleted?: string;
	    Untagged?: string;
	
	    static createFrom(source: any = {}) {
	        return new DeleteResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Deleted = source["Deleted"];
	        this.Untagged = source["Untagged"];
	    }
	}

}

export namespace main {
	
	export class ContainerItem {
	    id: string;
	    name: string;
	    image: string;
	    status: string;
	    command: string;
	    created: number;
	    state: string;
	    ports: string[];
	
	    static createFrom(source: any = {}) {
	        return new ContainerItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.image = source["image"];
	        this.status = source["status"];
	        this.command = source["command"];
	        this.created = source["created"];
	        this.state = source["state"];
	        this.ports = source["ports"];
	    }
	}
	export class ImageItem {
	    id: string;
	    repository: string;
	    tag: string;
	    size: string;
	    SizeBytes: number;
	    created: number;
	
	    static createFrom(source: any = {}) {
	        return new ImageItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.repository = source["repository"];
	        this.tag = source["tag"];
	        this.size = source["size"];
	        this.SizeBytes = source["SizeBytes"];
	        this.created = source["created"];
	    }
	}

}


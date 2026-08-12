export namespace client {
	
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

}


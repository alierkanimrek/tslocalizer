



const xhr = new XMLHttpRequest()









interface EventCallback {
    type:string,
    callback:Function
}







export class Translator {



    private _root:string                // File location
    private _app:string                 // App name
    private _lang:any                   // lang.json file content
    private _locales:Array<string>      // Locale names in English
    private _ids:Array<string>          // Locale ids like en-us
    private _nativeNames:Array<string>  // Locale nativeNames
    private _state:boolean              // Loading state
    private _current:string             // current locale id
    private _letchange:string           // locale id that attempting to change
    private _default:string             // default locale id
    private _txt:JSON|any               // app locale txt content
    private events: Array<EventCallback> = []    //Event 




    constructor(root:string, appName:string, defaultId?:string) {
        this._root = root
        this._app = appName
        this._state = false
        this._lang = {}
        this._locales = []
        this._ids = []
        this._nativeNames = []
        if (defaultId) {    this._default = defaultId} 
        else {    this._default = "en-us"}
        this._letchange = ""
        this._current = ""
        this._txt = JSON.parse("{}")

        //Load lang.json on initializing
        xhr.open("GET", this._root+"lang.json", true)
        xhr.onreadystatechange = this.load.bind(this, xhr)
        console.info("[i18n] Loading...")
        xhr.send()
    }




    private load(xhr:XMLHttpRequest):void{

        //Find filename
        let uri = xhr.responseURL.split("/")
        let file = uri[uri.length-1]
        let lang = false
        if( file == "lang.json"){
            lang = true
        }

        if (xhr.readyState == 4) {
            if (xhr.status == 200) { 

                // Loaded
                try{
                    if(lang){
                        //Lang file
                        this._lang = JSON.parse(xhr.response)
                    }else{
                        //Text file
                        this._txt = JSON.parse(xhr.response)
                    }
                }
                catch{
                    console.error("[i18n] "+file+" is not valid JSON format")
                    return
                }
                if(lang){
                    //lang.json
                    this.parse()
                }else{
                    //locale txt file
                    this._current = this._letchange
                    this.updateStatics()
                    this._state = true
                    this.dispatchEvent("change")
                }
            } else {
                console.error("[i18n] "+file+" could not load, "+xhr.statusText)
            }
        }
    }





    private parse():void {
        /*
            Parsing lang.json
        */
        try{
            for (let l in this._lang) {
                this._locales.push(l)
                this._nativeNames.push( this._lang[l]["native"])
                this._ids.push(this._lang[l]["id"])
            }
            console.info("[i18n] Available languages : "+String(this._locales))
        }
        catch{
            console.error("[i18n] lang.json is not valid")
            return
        }
        this.change(this.resolveInitId())
    }




    private resolveInitId():string{
        /*
            Find initial language
        */        
        
        // Default lang has highest priority 
        // Default can be initial id
        if(this.name(this._default)){    return(this._default) }

        // Otherwise let set browser language
        console.warn("[i18n] Default language not found : "+this._default)
        let sys = navigator.language.toLowerCase()
        if(this.name(sys)){    return(sys) }

        // neither of them let choose first
        console.warn("[i18n] Browser language not found : "+sys)
        for (let l in this._lang) {
            return(this._lang[l]["id"])
        }
    }




    private getCookie():string {
        const value = "; " + document.cookie
        const parts = value.split("; lastlang=")
        
        if (parts.length == 2) {
            return parts.pop().split(";").shift()
        }
    }




    public change(id:string):void{
        /*
            Change language
        */
        if(id == this._current){
            this.updateStatics()
            return           
        }
        // If exist in lang
        if(this.name(id)){
            this._letchange = id
            xhr.open("GET", this._root+this._app+"_"+id+".json", true)
            xhr.onreadystatechange = this.load.bind(this, xhr)
            console.info("[i18n] loading "+this._app+"_"+id)
            xhr.send()
        }
        else{
            console.error("[i18n] Language not found : "+id)
        }
    }



    public addEventListener(type: string, listener: Function):void{
        this.events.push({type:type, callback:listener})
    }




    private dispatchEvent(type:string):void{
        this.events.forEach((evt:EventCallback)=>{
            if(type == evt.type){
                evt.callback(this)
            }
        })
    }




    public get current() : string {
        /*
            Get current id
        */
        return (this._current)
    }




    public get state() : boolean {
        return (this._state)
    }




    public get ids() : Array<string> {
        return (this._ids)
    }




    public get locales() : Array<string> {
        return (this._locales)
    }




    public get names() : Array<string> {
        return (this._nativeNames)
    }




    public id(name:string):string {
        if(this._nativeNames.indexOf(name) > -1){
            return(this._ids[this._nativeNames.indexOf(name)])
        }
    }




    public name(id:string):string {
        if(this._ids.indexOf(id) > -1){
            return(this._nativeNames[this._ids.indexOf(id)])
        }
    }




    public get txt():JSON{
        return(this._txt)
    }




    public translations(section:string):GetText{
        /*
            Return GetText object of given section traslations
        */
        try{
            this._txt[section]
            return(new GetText(this, section))
        }catch{
            console.warn("[i18n] Section not found :"+section)
        }
    }




    public updateSectionStatics(section:string):void{
        /*
            Change DOM elements according to static values of given section
        */
        try{
            let statics = this._txt[section]["static"]
            Object.keys(statics).forEach((id:string)=>{
                let props = statics[id]
                Object.keys(props).forEach((prop:string)=>{
                    let val = props[prop]
                    let elm = <any>document.getElementById(id)
                    if(elm){
                        //Object.defineProperty(elm, prop, {value:val})
                        //elm.setAttribute(prop, String(val))
                        elm[prop] = val
                    }
                })
            })
        }catch{
            console.warn("[i18n] Section not found :"+section)
        }        
    }




    private updateStatics():void{
        /*
            Change all section statics
        */
        Object.keys(this._txt).forEach((section:string)=>{
            this.updateSectionStatics(section)
        })
    }

}








export class GetText {




    private trns:Translator
    private section:string




    constructor(translator:Translator, section:string){
        this.trns = translator
        this.section = ""
        this.section = section 
    }




    public updateStatics():void{
        this.trns.updateSectionStatics(this.section)
    }




    public _(id:string):string{
        /*
            Return dynamic txt
        */
        let txt = <any>this.trns.txt
        try{    return(txt[this.section]["dynamic"][id]) }
        catch{    return("")}
    }




    public get_():Function{
        return(this._.bind(this))
    }

}






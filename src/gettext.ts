



const xhr = new XMLHttpRequest()









export class Translator {



    private _root:string
    private _app:string
    private _lang:any
    private _locales:Array<string> 
    private _ids:Array<string> 
    private _nativeNames:Array<string> 
    private _state:boolean
    private _current:string
    private _letchange:string
    private _default:string
    private _txt:JSON|any




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
        this._txt = this._txt = JSON.parse("{}")
        xhr.open("GET", this._root+"lang.json", true)
        xhr.onreadystatechange = this.load.bind(this, xhr)
        console.log("[i18n] Loading...")
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
                    console.log("[i18n] "+file+" is not valid JSON format")
                    return
                }
                if(lang){
                    this.parse()
                }else{
                    this._current = this._letchange
                    this.updateStatics()
                    this._state = true
                }
            } else {
                console.log("[i18n] "+file+" could not load, "+xhr.statusText)
            }
        }
    }





    private parse():void {
        try{
            for (let l in this._lang) {
                this._locales.push(l)
                this._nativeNames.push( this._lang[l]["native"])
                this._ids.push(this._lang[l]["id"])
            }
        }
        catch{
            console.log("[i18n] lang.json is not valid")
            return
        }
        this.change(this.resolveInitId())
    }




    private resolveInitId():string{
        let sys = navigator.language.toLowerCase()
        //FIX IT
        let cookie = ""
        if(this.name(cookie)){    return(cookie) }
        if(this.name(sys)){    return(sys) }
        if(this.name(this._default)){    return(this._default) }
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
        if(id == this._current){
            this.updateStatics()
            return           
        }
        this._letchange = id
        xhr.open("GET", this._root+this._app+"_"+id+".json", true)
        xhr.onreadystatechange = this.load.bind(this, xhr)
        console.log("[i18n] loading "+this._app+"_"+id)
        xhr.send()
    }




    public get current() : string {
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
        try{
            this._txt[section]
            return(new GetText(this, section))
        }catch{
            console.log("[i18n] Section not found :"+section)
        }
    }




    public updateSectionStatics(section:string):void{
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
            console.log("[i18n] Section not found :"+section)
        }        
    }




    private updateStatics():void{
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
        let txt = <any>this.trns.txt
        try{    return(txt[this.section]["dynamic"][id]) }
        catch{    return("")}
    }




    public get_():Function{
        return(this._.bind(this))
    }

}






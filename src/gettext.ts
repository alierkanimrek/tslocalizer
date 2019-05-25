



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
    private _default:string
    private _txt:JSON|any




    constructor(root:string, appName:string, defaultId:string) {
        this._root = root
        this._app = appName
        this._state = false
        this._lang = {}
        this._locales = []
        this._ids = []
        this._nativeNames = []
        this._default = defaultId
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
                    this._state = true
                }
            } else {
                console.log("[i18n] "+file+" could not load, "+xhr.statusText)
            }
        }
    }





    private parse():void {
        try{
            for (var l in this._lang) {
                this._locales.push(l)
                this._nativeNames.push( this._lang[l]["native"])
                this._ids.push(this._lang[l]["id"])
            }
        }
        catch{
            console.log("[i18n] lang.json is not valid")
            return
        }
        if(this.name(this._default)){
            this.change(this._default)
        }
    }



    public change(id:string):void{

        xhr.open("GET", this._root+this._app+"_"+id+".json", true)
        xhr.onreadystatechange = this.load.bind(this, xhr)
        console.log("[i18n] loading "+this._app+"_"+id)
        xhr.send()
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
            return(new GetText(this))
        }
    }
}








class GetText {




    private trns:Translator
    private section:string




    constructor(translator:Translator, section?:string){
        this.trns = translator
        this.section = ""
        if(section){ this.section = section }
    }



    public updateStatics():void{
        //
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






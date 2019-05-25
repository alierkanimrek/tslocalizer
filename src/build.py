# -*- coding: utf-8 -*-



import gettext
import json
import glob
import os
import sys
import importlib



wd = os.getcwd()
applist = []        # ["app name",...]
lang = {}           # lang.json file
langIdList = []     # ["en-us",...]
modules = {}        # {"app name" : [modules,...]}


def mirror(arg):    return(arg)




def write(translation, app, lang):
    try:
        fn = os.path.join(app, app+"_"+lang+".json")
        js = json.dumps(translation, indent=2, separators=(',', ': '), ensure_ascii=False)
        f = open(fn, mode = "w", encoding = "utf-8")
        f.write(js)
        f.close() 
    except Exception as inst:
        print("\n")
        print(inst)
        sys.exit(-1)



#Load json
try:
    print("Loading language list")
    lang = json.load(open("lang.json"))
    for langName in lang.keys():
        langIdList.append(lang[langName]["id"])
    print(langIdList)
except Exception as inst:
    print(inst)
    sys.exit(-1)




#Find apps
print("\nSearching sources")
for fn in glob.glob("*"):
    if os.path.isdir(fn):
        applist.append(fn)
print(applist)
if(applist == []):  sys.exit(0)


print("\nLoading modules")        

for app in applist:
    print(app+" : [", end='')
    modules[app] = []
    wd = os.path.join(wd, app)
    
    for fn in glob.glob(os.path.join(wd, "*.py")):
        print("'"+os.path.basename(fn)+"', ", end='')

        #Import as module
        try:
            name = os.path.splitext(os.path.basename(fn))[0]
            spec = importlib.util.spec_from_file_location(name, fn)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            sys.modules[name] = mod
            modules[app].append(mod)
        except Exception as inst:
            print("\n")
            print(inst)
            sys.exit(-1)
    print("]\n")


print("\nBuilding languages...")


for langId in langIdList:
    
    print(langId)
    
    for app in applist:
        print("\t"+app)
        translation = {}

        for mod in modules[app]:
            name = list(mod.text(mirror).keys())[0]
            print("\t\t"+name)
            _ = gettext.translation(name, os.path.join(app, "mo"), [langId]).gettext
            translation[name] = mod.text(_)[name]
        write(translation, app, langId)




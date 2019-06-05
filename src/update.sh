#!/bin/bash

# This source file is part of the rpdev open source project
#    Copyright 2018 Ali Erkan IMREK and project authors
#    Licensed under the MIT License 



#path=$(dirname $(readlink -f $0))
path=$(pwd)
#cd $path

help(){
    echo 'update.sh myapp'
    echo 'update.sh myapp tr-tr; add new locale'
    exit -1
}


if [[ $1 == "" ]]; then
    help
fi


app_path=$path/$1
locale=$2

po_path=po
mo_path=mo
json_path=json





cd $app_path

# Create new po locale dir if second parameter given
if [[ ! $2 == "" ]]; then
    rm .*
    mkdir -p $po_path/$2
fi

#Get locale dir list
dirs="$(find $app_path/$po_path/* -type d)"

#Get last and current total bytes of source files
current="$(du -bs *.py)"
last="$(cat .py.total)"


if [ ! -d $po_path/$locale ]; then
    current=0
fi

#Check source changes
if [[ $current != $last ]]; then
    du -bs *.py > .py.total
    echo -e "\nUpdating source"

    #Every po locale dir
    for d in $dirs
    do
        locale="$(basename $d)"
        echo -e "$locale"
        cd $app_path

        #Every source file
        for app in *.py
        do
            cd $app_path
            #Create or update .POT locale source
            fn="${app%.*}"
            echo -e "\t$app "
            mkdir -p $po_path/
            echo -e  "\t\tUpdate pot"
            pwd
            echo $po_path/$fn.pot
            xgettext --language=Python --keyword=_ --from-code=UTF-8 --output=$po_path/$fn.pot $app
            sed -i 's/charset=CHARSET/charset=UTF-8/g' $po_path/$fn.pot

            cd $po_path

            #Check locale .PO 
            if [ ! -f $locale/$fn.po ]; then
                #Create .PO
                mkdir -p $locale/
                echo -e  "\t\t\tBuild po"
                msginit --input=$fn.pot --locale=$locale --output-file=$locale/$fn.po
            fi

            #Update .PO
            echo -e  "\t\t\tUpdate po"
            msgmerge --update $locale/$fn.po $fn.pot
        done
    done
fi


cd $app_path

#Get last and current total bytes of source files
current="$(du -bs $po_path)"
last="$(cat .po.total)"

if [ ! -d $mo_path/$locale ]; then
    current=0
fi

#Check PO changes
if [[ $current != $last ]]; then
    du -bs $po_path > .po.total
    echo -e "\nUpdate mo"

    #Every source
    for app in *.py
    do
        #Every locale dirs of PO
        for d in $dirs
        do
            locale="$(basename $d)"
            echo -e "$locale"
            cd $app_path
        
            #Create .MO
            fn="${app%.*}"
            echo -e "\t$app"
            mkdir -p $mo_path/$locale/LC_MESSAGES/
            mkdir -p $json_path/$locale/
            msgfmt $po_path/$locale/$fn.po --output-file $mo_path/$locale/LC_MESSAGES/$fn.mo
        done
    done
fi

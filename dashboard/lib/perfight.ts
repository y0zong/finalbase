export default function themePerfight(classname: string, auto: boolean = true) {
    return `(function(){${auto}&&(localStorage.getItem("theme")==="dark"||matchMedia("(prefers-color-scheme: dark)").matches)&&document.documentElement.classList.add("${classname}")})()`
}
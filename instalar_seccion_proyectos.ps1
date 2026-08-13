<#
instalar_seccion_proyectos.ps1
Corre esto DESDE C:\soportecyclops-web despues de descargar
seccion-proyectos-fragment.html y proyectos.css (quedan en Downloads
por defecto).
#>

$Site = "C:\soportecyclops-web"
$Downloads = "$env:USERPROFILE\Downloads"

# 1) Copiar el CSS a la carpeta css/
Copy-Item "$Downloads\proyectos.css" "$Site\css\proyectos.css" -Force

# 2) Insertar el <link> del CSS antes de </head>, si no esta ya
$index = Get-Content "$Site\index.html" -Raw
if ($index -notmatch 'proyectos\.css') {
    $index = $index -replace '</head>', "  <link rel=""stylesheet"" href=""css/proyectos.css"">`n</head>"
}

# 3) Insertar la seccion antes de </body>, si no esta ya
if ($index -notmatch 'id="proyectos"') {
    $fragment = Get-Content "$Downloads\seccion-proyectos-fragment.html" -Raw
    $index = $index -replace '</body>', "$fragment`n</body>"
}

Set-Content "$Site\index.html" $index -NoNewline

# 4) Commit y push
Set-Location $Site
git add index.html css/proyectos.css
git commit -m "Agregar seccion Proyectos a la home"
git push origin HEAD

Write-Host "Listo. Revisar index.html localmente y despues en el sitio publicado."

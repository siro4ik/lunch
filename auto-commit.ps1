# Авто-коммит для репозитория lunch
try {
    Set-Location -Path 'C:\Users\sanat\OneDrive\Документы\lunch'
} catch {
    exit 0
}

# Убедиться, что git доступен в PATH (на случай запуска из планировщика)
$gitCmd = 'git'
try {
    $null = & $gitCmd --version 2>$null
} catch {
    $gitCmd = 'C:\Program Files\Git\cmd\git.exe'
}

$status = & $gitCmd status --porcelain 2>$null
if (-not $status) {
    exit 0
}

& $gitCmd add -A

# Используем локальную конфигурацию автора коммита, не меняя глобальные настройки
& $gitCmd -c user.name="Auto Commit Bot" -c user.email="autocommit@example.com" commit -m ("chore: auto-commit " + (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')) 2>$null

exit 0




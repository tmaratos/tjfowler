# Add data-nav / data-footer-link / footer-hours hooks to public HTML (idempotent-ish)
$navMap = @{
  'href="index.html"' = @{ attr = 'data-nav="home"'; active = 'index.html' }
  'href="meet-dr-fowler.html"' = @{ attr = 'data-nav="meet-dr-fowler"' }
  'href="services.html"' = @{ attr = 'data-nav="services"' }
  'href="staff.html"' = @{ attr = 'data-nav="staff"' }
  'href="patient-resources.html"' = @{ attr = 'data-nav="patient-resources"' }
  'href="contact.html"' = @{ attr = 'data-nav="contact"' }
}
$footerMap = @{
  'href="meet-dr-fowler.html">Meet Dr. Fowler</a>' = 'href="meet-dr-fowler.html" data-footer-link="meet-dr-fowler">Meet Dr. Fowler</a>'
  'href="services.html">Services</a>' = 'href="services.html" data-footer-link="services">Services</a>'
  'href="staff.html">Our Staff</a>' = 'href="staff.html" data-footer-link="staff">Our Staff</a>'
  'href="contact.html">Contact</a>' = 'href="contact.html" data-footer-link="contact">Contact</a>'
}
$files = @(
  'meet-dr-fowler.html','services.html','staff.html','patient-resources.html','contact.html','404.html'
)
foreach ($f in $files) {
  $path = Join-Path (Join-Path $PSScriptRoot '..') $f
  if (-not (Test-Path $path)) { continue }
  $c = Get-Content $path -Raw
  foreach ($href in $navMap.Keys) {
    $attr = $navMap[$href].attr
    if ($c -notmatch [regex]::Escape($attr)) {
      $c = $c -replace "(<a\s+$href)(?![^>]*data-nav)", "`$1 $attr"
    }
  }
  foreach ($k in $footerMap.Keys) {
    if ($c -match [regex]::Escape($k) -and $c -notmatch 'data-footer-link') {
      $c = $c.Replace($k, $footerMap[$k])
    }
  }
  if ($c -notmatch 'data-editable="footer-hours"') {
    $c = $c -replace '(<div class="site-footer__hours">)', '<div class="site-footer__hours" data-editable="footer-hours">'
    $c = $c -replace '(<p class="site-footer__heading">Office Hours</p>)', '<p class="site-footer__heading" data-editable="footer-hours-heading">Office Hours</p>'
  }
  if ($c -notmatch 'data-editable="footer-copyright"') {
    $c = $c -replace '(<p>&copy; 2026 T\.J\. Fowler DDS)', '<p data-editable="footer-copyright">&copy; 2026 T.J. Fowler DDS'
  }
  if ($c -notmatch 'data-editable="mobile-call-label"') {
    $c = $c -replace '(<a class="mobile-call" href="tel:8656922222">)', '<a class="mobile-call" href="tel:8656922222" data-editable="mobile-call-label">'
  }
  Set-Content $path $c -NoNewline
}

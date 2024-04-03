این ابزار با هدف شناسایی تکرار هر کلمه در کتاب‌ها ایجاد شده تا زبان آموزان بتوانند کلمات پرتکرار مرتبط با رشته یا زمینه کاری خودشان یادبگیرند.

[دانلود نسخه ویندوز](https://github.com/Galaxy-sc/grandmom/releases/download/v0.1.1/grandmom.exe)

```sh
.\grandmom.exe .\book.pdf > words.txt
```

[دانلود نسخه لینوکس](https://github.com/Galaxy-sc/grandmom/releases/download/v0.1.1/grandmom)

```sh
./grandmom ./book.pdf > words.txt
```

اجرا و کامپایل دستی برنامه:
```sh
deno run -A ./grandmom.js ./book.pdf > words.txt

# compile
deno compile -A ./grandmom.js
```

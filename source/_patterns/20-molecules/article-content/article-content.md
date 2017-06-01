### Artikel-Inhaltsbereich

Der von eZ-Publish generierte Inhaltsbereich des Artikels aus dem Editor ist hierarchisch flach aufgebaut.
Textelemente wie h2, p, ul, etc. haben keine spezifische Klasse. SRF-Inhaltselemente werden auf der gleichen
Ebene in einem klassenlosen DIV eingefügt. Beispiel:

```
<div>
    <p></p>
	<a id="eztoc_1_1"></a>
	<h2>...</h2>
	<p>...</p>
	<div>
		<blockquote class="quote">...</blockquote>
	</div>
	<p>...</p>
	<div class="object-right">...</div>
	<p>...</p>
	<a id="eztoc_2_1"></a>
	<h2>...</h2>
	<div class="object-left">...</div>
	<ul>
		<li>...</li>
	</ul>
</div>
```


Damit die Formatierungen der Textelemente nicht global wirken, wurde dieser Wrapper für den Inhaltsbereich
eingeführt, der als "Namespace"
für diese Formatierungen dienen soll.
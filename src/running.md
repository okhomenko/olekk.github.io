---
layout: layouts/base.njk
title: Running
description: Endurance, ultrarunning, training, and lessons from long distances.
permalink: running.html
structuredData:
  "@context": "https://schema.org"
  "@type": "CollectionPage"
  name: Running
  url: https://olekk.com/running.html
---

<h1>Running</h1>

<p>
Endurance running has become one of the most important feedback loops in my life.
Mountain races, ultramarathons, Florida swamp trails, travel runs, long training blocks, mistakes, adaptation, and the strange mental state that only shows up after many hours on foot.
</p>

<p>
This section is where I write about running, endurance, and the lessons that transfer between long-distance racing and building systems over long periods of time.
</p>

<h2>Posts</h2>

<ul class="posts">
  {% for post in collections.running | reverse %}
    <li>
      <a href="{{ post.url }}">{{ post.data.title }}</a>
      <time datetime="{{ post.date | htmlDateString }}">
        {{ post.date | readableDate }}
      </time>
      <p class="description">{{ post.data.description }}</p>
    </li>
  {% endfor %}
</ul>

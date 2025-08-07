const fs = require('fs');
const path = require('path');

// GraphQL endpoint
const GRAPHQL_URL = "https://api.neynegar1.ir/graphql";


// GraphQL queries
const GET_ALL_PRODUCTS = `
  query GetAllProducts($page: Int, $limit: Int) {
    allProducts(page: $page, limit: $limit) {
      products {
        _id
        title
        majorCat
        minorCat
        brand
        status
        showCount
      }
      totalPages
      total
    }
  }
`;

const GET_ALL_ARTICLES = `
  query GetAllArticles($page: Int, $limit: Int) {
    articles(page: $page, limit: $limit) {
      articles {
        _id
        title
        majorCat
        minorCat
      }
      totalPages
      total
    }
  }
`;

const GET_ALL_COURSES = `
  query GetAllCourses($page: Int, $limit: Int) {
    courses(page: $page, limit: $limit) {
      courses {
        _id
        title
        category
      }
      totalPages
      total
    }
  }
`;

const GET_LINKS = `
  query GetLinks {
    links {
      _id
      txt
      path
      subLinks {
        link
        path
        brand
      }
    }
  }
`;

async function fetchGraphQL(query, variables = {}) {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching GraphQL data:', error);
    return null;
  }
}

async function getAllProducts() {
  const products = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const data = await fetchGraphQL(GET_ALL_PRODUCTS, { page, limit });

    if (!data || !data.allProducts) {
      console.error('Failed to fetch products');
      break;
    }

    const { products: pageProducts, totalPages } = data.allProducts;

    // فقط محصولات فعال و موجود را اضافه کن
    const activeProducts = pageProducts.filter(product =>
      product.showCount > 0
    );

    products.push(...activeProducts);

    if (page >= totalPages) {
      break;
    }

    page++;
  }

  return products;
}

async function getAllArticles() {
  const articles = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const data = await fetchGraphQL(GET_ALL_ARTICLES, { page, limit });

    if (!data || !data.articles) {
      console.error('Failed to fetch articles');
      break;
    }

    const { articles: pageArticles, totalPages } = data.articles;
    articles.push(...pageArticles);

    if (page >= totalPages) {
      break;
    }

    page++;
  }

  return articles;
}

async function getAllCourses() {
  const courses = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const data = await fetchGraphQL(GET_ALL_COURSES, { page, limit });

    if (!data || !data.courses) {
      console.error('Failed to fetch courses');
      break;
    }

    const { courses: pageCourses, totalPages } = data.courses;
    courses.push(...pageCourses);

    if (page >= totalPages) {
      break;
    }

    page++;
  }

  return courses;
}

async function getLinks() {
  const data = await fetchGraphQL(GET_LINKS);
  return data?.links || [];
}

function generateSitemapXML(urls) {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetStart = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetEnd = '</urlset>';

  const urlEntries = urls.map(url => {
    const { loc, lastmod, changefreq, priority } = url;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return `${xmlHeader}
${urlsetStart}
${urlEntries}
${urlsetEnd}`;
}

async function generateSitemap() {
  console.log('Starting sitemap generation...');

  const urls = [];
  const baseUrl = 'https://neynegar1.ir';
  const now = new Date().toISOString();

  // اضافه کردن صفحه اصلی
  urls.push({
    loc: baseUrl,
    lastmod: now,
    changefreq: 'daily',
    priority: '1.0'
  });

  try {
    // دریافت محصولات
    console.log('Fetching products...');
    const products = await getAllProducts();
    console.log(`Found ${products.length} products`);

    products.forEach(product => {
      urls.push({
        loc: `${baseUrl}/product/${product._id}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: '0.6'
      });
    });

    // دریافت مقالات
    console.log('Fetching articles...');
    const articles = await getAllArticles();
    console.log(`Found ${articles.length} articles`);

    articles.forEach(article => {
      urls.push({
        loc: `${baseUrl}/article/${article._id}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: '0.6'
      });
    });

    // دریافت دوره‌ها
    console.log('Fetching courses...');
    const courses = await getAllCourses();
    console.log(`Found ${courses.length} courses`);

    courses.forEach(course => {
      urls.push({
        loc: `${baseUrl}/course/${course._id}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: '0.7'
      });
    });

    // دریافت لینک‌ها و ایجاد صفحات دسته‌بندی
    console.log('Fetching links...');
    const links = await getLinks();
    console.log(`Found ${links.length} links`);

    links.forEach(link => {
      // اضافه کردن مسیر اصلی لینک
      if (link.path && link.path !== '/') {
        urls.push({
          loc: `${baseUrl}${link.path.startsWith('/') ? link.path : '/' + link.path}`,
          lastmod: now,
          changefreq: 'weekly',
          priority: '0.8'
        });
      }

      // اضافه کردن sublinks
      if (link.subLinks && link.subLinks.length > 0) {
        link.subLinks.forEach(subLink => {
          if (subLink.path && subLink.path !== '/') {
            urls.push({
              loc: `${baseUrl}${subLink.path.startsWith('/') ? subLink.path : '/' + subLink.path}`,
              lastmod: now,
              changefreq: 'weekly',
              priority: '0.8'
            });
          }
        });
      }
    });

    // تولید XML
    const sitemapXML = generateSitemapXML(urls);

    // ساخت sitemap-index.xml
    const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-0.xml</loc>
  </sitemap>
</sitemapindex>`;

    fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemapIndexXml, 'utf8');

    // ذخیره فایل
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap-0.xml');
    fs.writeFileSync(sitemapPath, sitemapXML, 'utf8');

    console.log(`Sitemap generated successfully with ${urls.length} URLs`);
    console.log(`Sitemap saved to: ${sitemapPath}`);

    return urls.length;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return 0;
  }
}

// اجرای اسکریپت اگر مستقیماً فراخوانی شود
if (require.main === module) {
  generateSitemap()
    .then(count => {
      console.log(`Sitemap generation completed. Total URLs: ${count}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Sitemap generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateSitemap }; 
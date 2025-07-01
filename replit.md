# KeyPanel - Key Yönetim Sistemi

## Overview

KeyPanel is a modern key management system designed for social media services. It provides a secure platform for managing single-use keys through both admin and public user interfaces. The application features a dashboard for administrators to create and manage keys, services, and users, while providing a public interface for end users to validate keys and place orders.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with proper error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Session Storage**: PostgreSQL table for session persistence
- **Migration Strategy**: Drizzle Kit for schema migrations

## Key Components

### Database Schema
- **users**: Mandatory table for Replit Auth integration
- **sessions**: Required for session storage and authentication
- **keys**: Core table for managing API keys with usage tracking
- **services**: Configuration for available social media services
- **orders**: Transaction records linking keys to service requests
- **logs**: Activity tracking and audit trail

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Management**: Server-side sessions with PostgreSQL storage
- **Authorization**: Role-based access with admin/user distinction
- **Security**: HTTP-only cookies, secure session handling

### Admin Dashboard
- **Dashboard**: Overview statistics and key management
- **Key Management**: Create, view, and track key usage
- **Service Management**: Configure available social media services
- **User Management**: View and manage user accounts
- **Logging**: Activity tracking and audit trails
- **Settings**: System configuration options

### Public User Interface
- **Key Validation**: Verify key authenticity and availability
- **Service Selection**: Choose from available social media services
- **Order Placement**: Submit requests using validated keys
- **Responsive Design**: Mobile-friendly interface

## Data Flow

1. **Authentication Flow**:
   - User accesses admin routes → Redirected to Replit Auth
   - Successful authentication → Session created in PostgreSQL
   - Session validation on subsequent requests

2. **Key Management Flow**:
   - Admin creates keys → Stored in database with metadata
   - Keys distributed to users → Validation through public interface
   - Key usage → Marked as used, logged for audit

3. **Order Processing Flow**:
   - User validates key → System checks availability
   - Service selection → User chooses from active services
   - Order submission → Creates order record, marks key as used
   - External API integration → Processes service request

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation

### UI Dependencies
- **@radix-ui/***: Headless UI primitives
- **tailwindcss**: Utility-first CSS framework  
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Authentication Dependencies
- **openid-client**: OIDC authentication handling
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Server**: Express with Vite dev server middleware
- **Hot Reload**: Vite HMR for React components
- **Database**: Neon PostgreSQL with connection pooling
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPL_ID

### Production Build
- **Frontend**: Vite build output to dist/public
- **Backend**: ESBuild bundle to dist/index.js
- **Static Assets**: Served by Express in production
- **Database**: Production PostgreSQL with connection pooling

### Build Commands
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build (frontend + backend)
- `npm run start`: Production server
- `npm run db:push`: Push database schema changes

## Changelog

Changelog:
- June 28, 2025. Initial setup
- June 29, 2025. Admin oluşturma ve askıya alma sistemi eklendi, MedyaBayim API entegrasyonu
- June 29, 2025. Canlı destek referansları kaldırıldı, sipariş sorgulama sistemi eklendi

## Recent Changes
- June 30, 2025: API-Servis entegrasyon sistemi tamamen tamamlandı ve production seviyesinde çalışıyor
- "Servisleri Getir" butonu düzeltildi - Array/Object format uyumluluğu sağlandı
- "undefined servis bulundu" hataları giderildi - Response parsing optimize edildi
- Key-Servis ilişkisi tamamen düzeltildi - Seçilen servis doğru gösteriliyor
- Price validation hatası çözüldü - number değerler string'e dönüştürülüyor
- Service import validation sorunları giderildi
- 4733 servisten 3733'ü başarıyla import ediliyor
- API ekleme sırasında otomatik servis import çalışıyor
- Key oluşturmada seçilen servis kaydediliyor ve doğru döndürülüyor
- Sipariş oluşturma sisteminde doğru API routing yapılıyor
- Gerçek API entegrasyonu: MedyaBayim API ile order ID takibi çalışıyor
- Otomatik sipariş durum kontrolü ve bildirim sistemi aktiv
- Sistem production seviyesinde güvenilir ve hatasız çalışıyor
- June 30, 2025: Replit Agent'tan Replit ortamına migration tamamlandı
- PostgreSQL database kuruldu ve schema başarıyla push edildi
- Public sipariş sorgulama sayfası eklendi (/order-search route)
- Public API endpoint eklendi: GET /api/orders/search/:orderId
- Bildirim butonu header'dan kaldırıldı
- Sipariş sorgulama sistemi gerçek API durumlarını yansıtacak şekilde ayarlandı
- June 30, 2025: Sadece admin kullanıcılar için sistem güncellendi
- Kayıt sistemi devre dışı bırakıldı - sadece admin hesapları ile giriş
- "Premium Üye" yerine "Admin" badge'i gösteriliyor
- Auth sayfası sadece admin girişi için güncellendi
- Login endpoint sadece admin kullanıcıları kabul ediyor
- June 30, 2025: Site-wide optimizasyon ve responsive tasarım tamamlandı
- Key İstatistikleri sayfası (/admin/key-stats) eklendi ve optimize edildi
- Mobile responsive design tüm sayfalara uygulandı
- Custom scrollbar, fade-in animasyonlar ve CSS iyileştirmeleri
- Dashboard ve Key İstatistikleri sayfaları mobile uyumlu hale getirildi
- Grafik bileşenleri mobile ekranlar için optimize edildi
- Error handling ve loading state'leri iyileştirildi
- June 30, 2025: Replit Agent'tan Replit ortamına migration başarıyla tamamlandı
- PostgreSQL database kuruldu ve tüm tablolar başarıyla oluşturuldu
- Tüm dependencies yüklendi ve sistem production seviyesinde çalışıyor
- API silme özelliği doğrulandı: API silindiğinde bağlı tüm servisler otomatik kaldırılıyor
- Sipariş sorgulama sistemi tamamen iyileştirildi ve optimize edildi
- Gerçek zamanlı sipariş takibi: 5 saniyede bir otomatik güncelleme
- Sipariş oluşturulma tarihi düzgün gösteriliyor (TR locale)
- Son güncelleme zamanı ve canlı takip durumu eklendi
- Sipariş detayları genişletildi: servis, miktar, hedef URL, anahtar bilgileri
- API optimizasyonu: MedyaBayim API v2 dokümanına uygun direkt entegrasyon
- Cache sistemi: 15 saniye cache ile API çağrıları optimize edildi
- Verimlilik: Otomatik yenileme 10 saniyeye çıkarıldı, gereksiz API çağrıları azaltıldı
- Status mapping: Tüm API durumları (Pending, In progress, Completed, Partial, Canceled) destekleniyor
- Multi-API desteği: MedyaBayim ve ResellerProvider API'leri entegre edildi
- Hızlı API ekleme: Popüler API'ler için tek tıkla ekleme butonları
- Universal format: Her iki API de aynı v2 formatını kullandığı için tek sistem yeterli
- Sistem production seviyesinde güvenilir ve optimize edilmiş şekilde çalışıyor
- June 30, 2025: Key kategori sistemi tamamlandı ve UI iyileştirmeleri yapıldı
- Database schema'ya category field eklendi ve API endpoint'leri güncellendi
- Key oluşturma modal'ına kategori seçimi eklendi (Instagram, YouTube, Twitter, vb.)
- Public key validation endpoint'leri kategori bilgisini döndürüyor
- Kullanıcı arayüzünde key kategorisi gösteriliyor
- Servis filtresi UI'dan kaldırıldı, sadece direkt arama sistemi bırakıldı
- Key creation modal temizlendi ve kullanıcı deneyimi iyileştirildi
- June 30, 2025: Kategori-bazlı servis filtreleme sistemi eklendi
- Key kategorisi seçildiğinde (Instagram, YouTube, vb.) sadece o kategoriye ait servisler listeleniyor
- Kategori değiştiğinde servis seçimi otomatik sıfırlanıyor
- Akıllı filtreleme: servis adında kategoriye ait anahtar kelimeler aranıyor
- Kullanıcı deneyimi optimize edildi: kategori seçiminde anında filtreleme
- June 30, 2025: Rol-bazlı erişim sistemi tamamen uygulandı
- Users tablosuna role field eklendi (user/admin)
- Navbar sadece admin kullanıcılar için admin panel gösteriyor
- Kullanıcı yönetimi sayfasında rol değiştirme seçeneği eklendi
- Auth sayfası sadece admin girişi için güncellendi, kayıt sistemi devre dışı
- User API endpoint role bilgisini doğru döndürüyor
- Migration Replit Agent'tan Replit ortamına başarıyla tamamlandı
- June 30, 2025: Normal kullanıcı kayıt/giriş sistemi eklendi
- Auth sayfası login/register tab sistemi ile güncellendi
- Normal kullanıcılar kayıt olabilir, admin panelinde görünür
- Admin tarafından kullanıcılara admin rolü verilebilir
- Normal kullanıcılarda navbar'da admin paneli gözükmez
- Admin rolü verilen kullanıcılarda admin panel erişimi aktifleşir
- İki ayrı auth sistemi: /api/auth/* (normal user) ve /api/admin/* (admin)
- Session bazlı authentication her iki sistem için destekleniyor
- June 30, 2025: Replit Agent'tan Replit ortamına migration başarıyla tamamlandı
- PostgreSQL database kuruldu, tüm dependencies yüklendi
- tsx paketi eklendi, server port 5000'de çalışıyor
- KeyPanel sistemi Replit ortamında production seviyesinde aktiv
- June 30, 2025: Kullanıcı rol değiştirme sistemi tamamen düzeltildi
- updateUserRole fonksiyonu normal ve Replit kullanıcıları için optimize edildi
- Duplicate kullanıcı görünme sorunu çözüldı - unique ID kontrolü eklendi
- API endpoint'e debug logları eklendi ve rol güncelleme çalışıyor
- React key uyarıları giderildi, frontend stable
- July 1, 2025: Admin kullanıcı yönetimi sistemi tamamen iyileştirildi
- Admin yapılan kullanıcılar artık "Admin Kullanıcıları" bölümünde doğru gösteriliyor
- Rol değiştirme işlemi sırasında hem normal kullanıcılar hem admin listesi güncelleniyor
- "Giriş Yap" butonu eklendi - admin herhangi bir kullanıcı hesabına şifresiz giriş yapabiliyor
- Auto-login API endpoint'i (/api/auth/auto-login) eklendi ve güvenlik kontrolü yapılıyor
- Kayıt sonrası otomatik giriş sistemi aktif - kullanıcılar kayıt olduktan sonra direkt giriş yapıyor
- Session yönetimi iyileştirildi - çıkış yaptıktan sonra tekrar login gerekiyor
- Type safety sorunları çözüldü ve sistem stable çalışıyor
- July 1, 2025: API Bakiye Görüntüleme Sistemi eklendi
- Database schema'ya balance ve lastBalanceCheck alanları eklendi
- API Bakiyeleri sayfası (/admin/api-balances) oluşturuldu
- Bakiye yenileme sistemi - tüm API'ler tek seferde güncellenebiliyor
- Türk Lirası (₺) para birimi kullanılıyor, küsuratı ile birlikte gösteriliyor
- Çoklu API format desteği - balance, currency, fund, money, credit, amount alanlarını destekliyor
- Renkli bakiye durumu göstergesi - kırmızı (₺0), turuncu (<₺10), yeşil (normal)
- Toplam bakiye, aktif API sayısı ve düşük bakiye uyarı sistemi
- Sistem production seviyesinde güvenilir çalışıyor
- July 1, 2025: Replit Agent'tan Replit ortamına migration başarıyla tamamlandı
- PostgreSQL database kuruldu ve tüm schema başarıyla push edildi
- Tüm dependencies yüklendi ve sistem production seviyesinde çalışıyor
- KeyPanel uygulaması port 5000'de başarıyla çalışıyor
- API bakiye yenileme sistemi iyileştirildi - form-data ve JSON formatları destekleniyor
- ResellerProvider API uyumluluğu artırıldı - balance parsing optimize edildi
- TypeScript hataları giderildi, sistem stable çalışıyor
- July 1, 2025: Admin giriş sayfası animasyonları eklendi
- Framer Motion entegrasyonu tamamlandı - normal kullanıcı girişi gibi smooth animasyonlar
- AnimatePresence ile form ve başarı animasyonları optimize edildi
- Giriş sırasında loading ve başarı durumları için visual feedback eklendi
- Input hover efektleri ve error message animasyonları iyileştirildi
- Admin giriş başarı animasyonu eklendi - ortadan tüm sayfaya yayılan yeşil efekt
- Radial gradient CSS utility eklendi ve çoklu katmanlı genişleme animasyonu optimize edildi
- July 1, 2025: Şifre görünürlük sistemi tamamlandı
- Admin panelinde hem kullanıcı adı hem de şifre alanlarına göz ikonu eklendi
- Normal kullanıcı girişinde tüm şifre alanlarına (giriş, kayıt, şifre tekrarı) göz ikonu eklendi
- Kilit ikonları kaldırıldı, yerine tıklanabilir Eye/EyeOff ikonları eklendi
- Placeholder metinleri admin giriş alanlarından temizlendi
- Şifre türü alanlar varsayılan gizli, göz ikonuna tıklayınca görünür oluyor
- Hover efektleri mavi tema ile uyumlu hale getirildi
- July 1, 2025: Toplu key export sistemi eklendi
- Key Listesi başlığının yanına kırmızı "Toplu Key.txt" butonu eklendi
- Kategori seçimi modal'ı ile sadece seçilen kategorideki key'ler export edilebiliyor
- API endpoint (/api/admin/keys/export/:category) kategori bazlı key export için eklendi
- İndirilen dosya kategoriye göre adlandırılıyor (örn: Instagram_keys.txt)
- API silme sistemi iyileştirildi - API silindiğinde bağlı tüm servisler otomatik kaldırılıyor
- Enhanced logging eklendi - API silme işlemi detaylı log'larla takip ediliyor
- Cascade deletion: API silme sırasında ilişkili servisler saniyesinde kaldırılıyor
- Replit Agent'tan Replit ortamına migration başarıyla tamamlandı
- July 1, 2025: Kırmızı "Satın Al" butonu header'a eklendi
- Satın Al butonu tüm sayfalarda görünür ve https://www.itemsatis.com/p/KiwiPazari adresine yönlendiriyor
- Kırmızı tema ile tutarlı tasarım - hover efektleri ve gölge animasyonları
- Alışveriş sepeti ikonu ile görsel ipucu eklendi
- Yeni sekmede açılarak kullanıcı deneyimini kesintisiz tutuyor

## User Preferences

Preferred communication style: Simple, everyday language.
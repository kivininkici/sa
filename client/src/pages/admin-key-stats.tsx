import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

type TimeRange = "24h" | "7d" | "30d" | "6m" | "1y" | "all";

interface KeyStatsData {
  date: string;
  keySelections: number;
  keyUsage: number;
  newKeys: number;
}

interface StatsResponse {
  data: KeyStatsData[];
  summary: {
    totalSelections: number;
    totalUsage: number;
    averageDaily: number;
    peakDay: {
      date: string;
      count: number;
    };
  };
}

const timeRangeLabels = {
  "24h": "Son 24 Saat",
  "7d": "Son 7 Gün", 
  "30d": "Son 30 Gün",
  "6m": "Son 6 Ay",
  "1y": "Son 1 Yıl",
  "all": "Tüm Zamanlar"
};

export default function AdminKeyStats() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("7d");
  const { admin, isAuthenticated } = useAdminAuth();

  const { data: statsData, isLoading } = useQuery<StatsResponse>({
    queryKey: ["/api/admin/key-stats", selectedRange],
    enabled: isAuthenticated && !!admin,
  });

  if (!isAuthenticated || !admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Yetkisiz Erişim</h2>
          <p className="text-muted-foreground">Bu sayfaya erişim için admin yetkisi gerekli.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Key İstatistikleri" description="Günlük key seçimleri ve kullanım analizi" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-white">Key İstatistikleri</h1>
                <p className="text-slate-400 text-sm md:text-base">Günlük key seçimleri ve kullanım analizi</p>
              </div>
            </div>
          </div>

      {/* Zaman Aralığı Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Zaman Aralığı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
            {Object.entries(timeRangeLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedRange === key ? "default" : "outline"}
                onClick={() => setSelectedRange(key as TimeRange)}
                className="text-xs md:text-sm min-w-[100px] md:min-w-[120px]"
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Özet İstatistikler */}
      {statsData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Seçim</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.summary.totalSelections.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {timeRangeLabels[selectedRange]} içinde
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kullanım</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.summary.totalUsage.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Başarılı key kullanımı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Günlük Ortalama</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(statsData.summary.averageDaily).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Key seçimi/gün
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Yoğun Gün</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.summary.peakDay.count.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {new Date(statsData.summary.peakDay.date).toLocaleDateString('tr-TR')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grafik */}
      <Card>
        <CardHeader>
          <CardTitle>Günlük Key Seçimleri</CardTitle>
          <p className="text-sm text-muted-foreground">
            {timeRangeLabels[selectedRange]} içindeki key seçimi ve kullanım trendi
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Veriler yükleniyor...</p>
              </div>
            </div>
          ) : statsData && statsData.data.length > 0 ? (
            <div className="h-[300px] md:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statsData.data} margin={{ top: 20, right: 15, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs md:text-sm"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      if (selectedRange === "24h") {
                        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                      } else if (selectedRange === "7d" || selectedRange === "30d") {
                        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
                      } else {
                        return date.toLocaleDateString('tr-TR', { month: '2-digit', year: '2-digit' });
                      }
                    }}
                  />
                  <YAxis className="text-xs md:text-sm" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString('tr-TR')}
                    formatter={(value: number, name: string) => [
                      value.toLocaleString(),
                      name === 'keySelections' ? 'Key Seçimi' : 
                      name === 'keyUsage' ? 'Key Kullanımı' : 'Yeni Key'
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="keySelections" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="keyUsage" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--chart-2))', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="newKeys" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--chart-3))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Henüz veri bulunmuyor</p>
                <p className="text-muted-foreground">Seçilen zaman aralığında key istatistiği bulunmuyor.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </main>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Widgets';
import { api } from '../services/api';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        const result = await api.getNews();
        if (result.success) {
            setNews(result.data);
        } else {
            setError("Gagal memuat berita. Silakan coba lagi.");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Newspaper className="text-teal-600" />
                            Berita Medis Terkini
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Rangkuman berita kesehatan pernapasan terbaru yang dikurasi oleh AI.
                        </p>
                    </div>
                    <Button variant="ghost" onClick={fetchNews} disabled={loading} className="text-slate-500 hover:text-teal-600">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </header>

                {loading ? (
                    <div className="min-h-[50vh] flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
                        <p className="text-slate-500 animate-pulse font-medium">AI sedang mencari dan merangkum berita global...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={fetchNews}>Coba Lagi</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden group">
                                    <div className="h-2 bg-gradient-to-r from-teal-400 to-blue-500" />
                                    <div className="p-6 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <Badge variant="info" className="bg-blue-50 text-blue-600 border-blue-100">
                                                {item.source || 'Sumber Terpercaya'}
                                            </Badge>
                                            <span className="text-xs text-slate-400">{item.date}</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                                            {item.title}
                                        </h3>

                                        <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-4 leading-relaxed">
                                            {item.summary}
                                        </p>

                                        <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                            <span className="text-xs text-slate-400 italic">Dikurasi oleh Gemini AI</span>
                                            {/* Since we don't have real URLs in the prompt response usually, we mock the link or just show text */}
                                            <button className="flex items-center text-teal-600 text-sm font-semibold hover:text-teal-700 transition-colors">
                                                Baca <ExternalLink size={14} className="ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;

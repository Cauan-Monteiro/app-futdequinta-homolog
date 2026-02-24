import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

// filepath: c:/Users/cauan-monteiro/OneDrive - PUCRS - BR/FutDeQuinta - Homolog/FutQuinta/src/routes/Login.tsx

interface LoginFormData {
    email: string;
    password: string;
}

export default function Login() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Implementar lógica de autenticação aqui
            console.log('Login attempt:', formData);
            alert('Funcionalidade de login em desenvolvimento!');
        } catch (err) {
            console.error(err);
            alert('Erro ao fazer login!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">FutQuinta</h1>
                    <p className="text-gray-400">Gerencie seus times e partidas</p>
                </div>

                {/* Login Card */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu.email@exemplo.com"
                                required
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-right">
                            <Link
                                to="#"
                                className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                            >
                                Esqueci minha senha
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <span className="spinner"></span>
                                    Entrando...
                                </div>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-600"></div>
                        <span className="px-3 text-gray-500 text-sm">ou</span>
                        <div className="flex-1 border-t border-gray-600"></div>
                    </div>

                    {/* Create Account Link */}
                    <div className="text-center">
                        <p className="text-gray-400 text-sm">
                            Não tem uma conta?{' '}
                            <Link
                                to="/register"
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                Criar conta
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-xs mt-8">
                    © 2024 FutQuinta. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
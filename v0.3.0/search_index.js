var documenterSearchIndex = {"docs":
[{"location":"#SpeedMapping.jl","page":"Home","title":"SpeedMapping.jl","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"speedmapping","category":"page"},{"location":"#SpeedMapping.speedmapping","page":"Home","title":"SpeedMapping.speedmapping","text":"SpeedMapping\n\nspeedmapping(x₀; m!, kwargs...) accelerates the convergence of a mapping  m!(x_out, x_in) to a fixed point of m! by the Alternating cyclic  extrapolation algorithm (ACX). Since gradient descent is an example  of such mapping, speedmapping(x0; g!, kwargs...) can also perform multivariate  optimization based on the gradient function g!(∇, x).\n\nReference: N. Lepage-Saucier, Alternating cyclic extrapolation methods for optimization  algorithms, arXiv:2104.04974 (2021). https://arxiv.org/abs/2104.04974\n\nArguments\n\nx₀ :: AbstractArray: The starting point; must be of eltype Float.\n\nMain keyword arguments:\n\nm!(x_out, x_in): A map for which a fixed-point must be found.\ng!(∇, x): The gradient of a function to be minimized.\nf(x): The objective of the function to be minimized. It is useful to i)   compute a good initial α (learning  rate) for the gradient descent, ii)   optimize using autodiff or iii) track the progress of the algorithm. In   case neither m! nor g! is provided, then f is used to compute g   using ForwardDiff.\nlower, upper :: Union{AbstractArray, Nothing} = nothing: Box constraints    for the optimization. NOTE: When appropriate, it should also be used with    m!. Even if m! always keeps x_out within bounds, an extrapolation    step could throw x out of bounds.\ntol :: Float64 = 1e-8, Lp :: Real = 2 When using m!, the algorithm    stops when norm(F(xₖ) - xₖ, Lp) ≤ tol. When using g!, the algorithm    stops when norm(∇f(xₖ), Lp) ≤ tol. \nmaps_limit :: Real = 1e6: Maximum number of m! calls or g! calls. \ntime_limit :: Real = 1000: Maximum time in seconds.\n\nMinor keyword arguments:\n\norders :: Array{Int64} = [3, 3, 2] determines ACX's alternating order.    Must be between 1 and 3 (where 1 means no extrapolation). The two recommended   orders are [3, 2] and [3, 3, 2], the latter being potentially better for    highly non-linear applications (see paper).\ncheck_obj :: Bool = false: In case of NaN or Inf values, the algorithm   restarts at the best past iterate. If check_obj = true, progress is    monitored with the value of the objective (requires f).    Otherwise, it is monitored with norm(F(xₖ) - xₖ, Lp). Advantages of    check_obj = true: more precise and if the algorithm converges on a bad    local minimum, it can return the best of all past iterates. Advantages of    check_obj = false: for well-behaved convex problems, it avoids the    effort and time of providing f and calling it at every iteration.\nstore_info :: Bool = false: Stores xₖ, σₖ and αₖ (see paper).\nbuffer :: Float64 = 0.01 If xₖ goes out of bounds, it is brought back in   with a buffer. Ex. xₖ = buffer * xₖ₋₁ + (1 - buffer) * upper. Setting    buffer = 0.001 may speed-up box-constrained optimization.\n\nKeyword arguments to fine-tune fixed-point mapping acceleration (using m!):\n\nσ_min :: Real = 0.0: Setting to 1 may avoid stalling (see paper).\nstabilize :: Bool = false: performs a stabilization mapping before    extrapolating. Setting to true may improve the performance for    applications like accelerating the EM or MM algorithms (see paper).\n\nExample: Finding a dominant eigenvalue\n\njulia> using LinearAlgebra\n\njulia> using SpeedMapping\n\njulia> A = ones(10) * ones(10)' + Diagonal(1:10);\n\njulia> function power_iteration!(x_out, x_in, A)\n           mul!(x_out, A, x_in)\n           x_out ./= maximum(abs.(x_out))\n       end;\n\njulia> res = speedmapping(ones(10); m! = (x_out, x_in) -> power_iteration!(x_out, x_in, A))\n(minimizer = [0.4121491412218099, 0.4409506073968953, 0.47407986465655094, 0.5125916147320677, 0.5579135738427361, 0.612027372716759, 0.6777660406970623, 0.7593262786058275, 0.8632012019116189, 1.0], maps = 16, f_calls = 0, converged = true, norm_∇ = 2.804263612262994e-9, info = nothing)\n\njulia> V = res.minimizer;\n\njulia> dominant_eigenvalue = V'A * V / V'V\n16.3100056907922\n\n\nExample: Minimizing a multidimensional Rosenbrock\n\njulia> f(x) = sum(100 * (x[i,1]^2 - x[i,2])^2 + (x[i,1] - 1)^2 for i ∈ 1:size(x,1));\n\njulia> function g!(∇, x)\n           ∇[:,1] .=  400(x[:,1].^2 .- x[:,2]) .* x[:,1] .+ 2(x[:,1] .- 1)\n           ∇[:,2] .= -200(x[:,1].^2 .- x[:,2])\n           return nothing\n       end;\n\njulia> x₀ = 1.0 * [-4 -3 -2 -1; 0 1 2 3]';\n\nOptimizing, providing f and g!\n\njulia> speedmapping(x₀; f, g!)\n(minimizer = [0.999999999982878 0.9999999999656839; 0.9999999999732417 0.9999999999463607; 0.9999999998875755 0.9999999997746609; 0.9999999951927082 0.9999999903661674], maps = 180, f_calls = 11, converged = true, norm_∇ = 4.306438901515058e-9, info = nothing)\n\nOptimizing without objective\n\njulia> speedmapping(x₀; g!)\n(minimizer = [1.000000000000002 1.000000000000004; 0.999999999999956 0.9999999999999117; 0.9999999999998761 0.9999999999997516; 0.999999999999863 0.9999999999997254], maps = 148, f_calls = 0, converged = true, norm_∇ = 2.7446698204458767e-13, info = nothing)\n\nOptimizing without gradient\n\njulia> speedmapping(x₀; f)\n(minimizer = [0.9999999999957527 0.9999999999914151; 0.9999999999933037 0.9999999999865801; 0.9999999999716946 0.9999999999432596; 0.9999999987753265 0.999999997545751], maps = 172, f_calls = 11, converged = true, norm_∇ = 1.0971818937506587e-9, info = nothing)\n\nOptimizing with a box constraint\n\njulia> speedmapping(x₀; f, g!, upper = [0.5ones(4) Inf * ones(4)])\n(minimizer = [0.5 0.25; 0.49999999999999434 0.24999999996939753; 0.5 0.24999999999999997; 0.4999999999999999 0.24999999999948902], maps = 71, f_calls = 7, converged = true, norm_∇ = 8.135561263867014e-9, info = nothing)\n\n\n\n\n\n","category":"function"}]
}
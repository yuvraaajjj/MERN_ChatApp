export default function Avatar({id, username, online, isAiBot}){
    // Change userId to id to match what's passed from Person
    const colors = ['bg-red-200','bg-green-200','bg-purple-200',
        'bg-pink-200','bg-blue-200']

    const userIdBase10 = parseInt(id, 16)
    const colorIndex = userIdBase10 % colors.length
    const color = colors[colorIndex]

    return(
        <div className={`w-8 h-8 relative rounded-full flex items-center ${color} `}>
            <div className="text-center w-full opacity-70">
                {isAiBot ? '🤖' : username?.[0]}
            </div>
            {online && (
                <div className="absolute w-2 h-2 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
            )} 
            {!online && (
                <div className="absolute w-2 h-2 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
            )}
        </div>
    )
}
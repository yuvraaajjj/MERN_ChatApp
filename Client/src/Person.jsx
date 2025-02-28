import Avatar from "./Avatar"

export default function Person({id,username,onClick,selected,online}){
    
    const isAiBot = id === "ai-bot"


    return(
        <div onClick={() => onClick(id)} 
        className={`rounded-sm hover:bg-[#f5efd0] hover:translate-x-0.5 translate-y-1 transition-all duration-300 border-b items-center border-gray-100  flex gap-2 cursor-pointer ${selected ? "bg-[#EBE5C2]" : ""}`}>
            {selected && (
              <div className="w-1 bg-[#504B38] h-12 rounded-r-md"></div>
            )}
            <div className="flex gap-2 pl-4 py-2 items-center">
                <Avatar online={online} username={username} id={id} isAiBot = {isAiBot}/>
                <span className="text-gray-800">
                    {username}
                    {isAiBot && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                            AI
                        </span>
                    )}
                </span>
            </div>
        </div>
    )
}